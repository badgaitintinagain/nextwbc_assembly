import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

// บันทึก prediction logs
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const detections = JSON.parse(formData.get('detections') as string);
    
    // ค้นหาข้อมูลผู้ใช้
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // สร้าง log entry ใหม่
    const predictionLog = await prisma.predictionLog.create({
      data: {
        userId: user.id,
        imageCount: files.length,
        detections: detections
      }
    });
    
    // บันทึกรูปภาพ
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const annotatedFileData = formData.get(`annotated_${i}`) as File;
      
      // อ่านข้อมูลไฟล์เป็น Buffer
      const originalBuffer = Buffer.from(await file.arrayBuffer());
      let annotatedBuffer = null;
      
      if (annotatedFileData) {
        annotatedBuffer = Buffer.from(await annotatedFileData.arrayBuffer());
      }
      
      // บันทึกลงฐานข้อมูล
      await prisma.predictionImage.create({
        data: {
          predictionLogId: predictionLog.id,
          originalImage: originalBuffer,
          annotatedImage: annotatedBuffer,
          mimeType: file.type,
          filename: file.name
        }
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      predictionId: predictionLog.id 
    });
    
  } catch (error) {
    console.error("Error saving prediction:", error);
    return NextResponse.json({ error: "Failed to save prediction" }, { status: 500 });
  }
}

// ดึงข้อมูล prediction logs
export async function GET() {
  try {
    console.log("Starting prediction logs fetch");
    // Get the user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`Fetching logs for user: ${session.user.email}`);
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.log(`User not found: ${session.user.email}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`User found: ${user.id}, fetching prediction logs`);
    // Get prediction logs with their images - remove 'detections' from include
    const predictionLogs = await prisma.predictionLog.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: 'desc' },
      include: {
        images: true,
        // Remove 'detections: true' as it's not a relation field
      },
    });

    console.log(`Found ${predictionLogs.length} prediction logs`);
    
    // Transform the data for frontend consumption
    const processedLogs = await Promise.all(
      predictionLogs.map(async (log, index) => {
        console.log(`Processing log ${index+1}/${predictionLogs.length}: ${log.id}`);
        try {
          // Parse the detections JSON if it's a string (now from the main log object)
          let detections;
          try {
            detections = typeof log.detections === 'string' 
              ? JSON.parse(log.detections) 
              : log.detections || [];
          } catch (parseError) {
            console.error(`Error parsing detections for log ${log.id}:`, parseError);
            detections = []; // Default to empty array on parse error
          }
          
          // Process images
          const processedImages = await Promise.all(
            (log.images || []).map(async (img, imgIndex) => {
              try {
                let originalBase64 = null;
                let annotatedBase64 = null;
                
                if (img.originalImage) {
                  originalBase64 = Buffer.from(img.originalImage).toString('base64');
                }
                
                if (img.annotatedImage) {
                  annotatedBase64 = Buffer.from(img.annotatedImage).toString('base64');
                }
                
                return {
                  id: img.id,
                  filename: img.filename || `image-${imgIndex}`,
                  mimeType: img.mimeType || 'image/jpeg',
                  originalImage: originalBase64,
                  annotatedImage: annotatedBase64,
                  predictionLogId: img.predictionLogId,
                };
              } catch (imgError) {
                console.error(`Error processing image ${imgIndex} for log ${log.id}:`, imgError);
                return {
                  id: img.id || `error-img-${imgIndex}`,
                  filename: `error-image-${imgIndex}`,
                  mimeType: 'image/jpeg',
                  originalImage: null,
                  annotatedImage: null,
                  predictionLogId: img.predictionLogId,
                };
              }
            })
          );
          
          return {
            id: log.id,
            userId: log.userId,
            timestamp: log.timestamp,
            imageCount: log.imageCount || 0,
            title: (log as { title?: string }).title || '',
            description: (log as { description?: string }).description || '',
            images: processedImages,
            detections: detections
          };
        } catch (logError) {
          console.error(`Error processing log ${log.id}:`, logError);
          return {
            id: log.id,
            userId: log.userId,
            timestamp: log.timestamp || new Date(),
            imageCount: 0,
            title: 'Error loading data',
            images: [],
            detections: []
          };
        }
      })
    );

    console.log("Successfully processed all logs");
    return NextResponse.json(processedLogs);
  } catch (error) {
    console.error('Error fetching prediction logs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({ 
      error: 'Failed to fetch predictions', 
      message: errorMessage
    }, { status: 500 });
  }
}

// DELETE handler for deleting predictions
export async function DELETE(request: NextRequest) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get the IDs of predictions to delete from request body
    const { ids } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No prediction IDs provided' }, { status: 400 });
    }
    
    // First, verify that all the logs belong to the user
    const logs = await prisma.predictionLog.findMany({
      where: {
        id: { in: ids },
      },
    });
    
    const unauthorizedLogs = logs.filter(log => log.userId !== user.id);
    if (unauthorizedLogs.length > 0) {
      return NextResponse.json({ error: 'Unauthorized to delete some logs' }, { status: 403 });
    }
    
    // Delete related records first (to handle foreign key constraints)
    // Remove the detection.deleteMany call since the model doesn't exist
    
    // Delete images
    await prisma.predictionImage.deleteMany({
      where: {
        predictionLogId: { in: ids },
      },
    });
    
    // Delete the logs themselves
    await prisma.predictionLog.deleteMany({
      where: {
        id: { in: ids },
      },
    });
    
    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error) {
    console.error('Error deleting predictions:', error);
    return NextResponse.json({ error: 'Failed to delete predictions' }, { status: 500 });
  }
}