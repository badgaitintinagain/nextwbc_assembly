import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

// บันทึก prediction logs
export async function POST(request: Request) {
  console.log("🔍 [API] POST /api/predictions started");
  
  const session = await getServerSession(authOptions);
  console.log("🔍 [API] Session check:", session?.user?.email ? "authenticated" : "not authenticated");
  
  if (!session?.user?.email) {
    console.log("❌ [API] Unauthorized - no session");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    console.log("🔍 [API] Parsing form data...");
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const detectionsString = formData.get('detections') as string;
    
    console.log("🔍 [API] Files count:", files.length);
    console.log("🔍 [API] Detections string length:", detectionsString?.length || 0);
    
    let detections;
    try {
      detections = JSON.parse(detectionsString);
      console.log("🔍 [API] Parsed detections:", detections.length);
    } catch (parseError) {
      console.error("❌ [API] Error parsing detections:", parseError);
      return NextResponse.json({ error: "Invalid detections format" }, { status: 400 });
    }
    
    // ค้นหาข้อมูลผู้ใช้ - เพิ่ม select เพื่อจำกัดข้อมูลที่ดึง
    console.log("🔍 [API] Finding user:", session.user.email);
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true } // ดึงเฉพาะ id
    });
    
    if (!user) {
      console.log("❌ [API] User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    console.log("🔍 [API] User found:", user.id);
    
    // สร้าง log entry ใหม่
    console.log("🔍 [API] Creating prediction log...");
    const predictionLog = await prisma.predictionLog.create({
      data: {
        userId: user.id,
        imageCount: files.length,
        detections: detections
      },
      select: { id: true } // ดึงเฉพาะ id ที่ต้องการ
    });
    
    console.log("✅ [API] Prediction log created:", predictionLog.id);
    
    // สร้าง array สำหรับ bulk insert
    console.log("🔍 [API] Processing images...");
    const imageData = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const annotatedFileData = formData.get(`annotated_${i}`) as File;
      
      console.log(`🔍 [API] Processing image ${i}: ${file.name}`);
      
      const originalBuffer = Buffer.from(await file.arrayBuffer());
      let annotatedBuffer = null;
      
      if (annotatedFileData) {
        console.log(`🔍 [API] Processing annotated image ${i}`);
        annotatedBuffer = Buffer.from(await annotatedFileData.arrayBuffer());
      }
      
      imageData.push({
        predictionLogId: predictionLog.id,
        originalImage: originalBuffer,
        annotatedImage: annotatedBuffer,
        mimeType: file.type,
        filename: file.name
      });
    }
    
    // Bulk insert สำหรับประสิทธิภาพที่ดีกว่า
    if (imageData.length > 0) {
      console.log("🔍 [API] Saving images to database...");
      await prisma.predictionImage.createMany({
        data: imageData
      });
      console.log("✅ [API] Images saved successfully");
    }
    
    console.log("✅ [API] Prediction saved successfully");
    return NextResponse.json({ 
      success: true, 
      predictionId: predictionLog.id 
    }, {
      headers: {
        'Cache-Control': 'no-store' // ป้องกัน cache สำหรับ POST
      }
    });
    
  } catch (error) {
    console.error("❌ [API] Error saving prediction:", error);
    console.error("❌ [API] Error stack:", error.stack);
    return NextResponse.json({ 
      error: "Failed to save prediction", 
      details: error.message 
    }, { status: 500 });
  }
}

// ดึงข้อมูล prediction logs - Optimized version
export async function GET() {
  try {
    console.log("Starting prediction logs fetch");
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`Fetching logs for user: ${session.user.email}`);
    // Find the user with limited select
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      console.log(`User not found: ${session.user.email}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`User found: ${user.id}, fetching prediction logs`);
    // Optimized query with selective fields
    const predictionLogs = await prisma.predictionLog.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: 'desc' },
      take: 50, // จำกัดจำนวนผลลัพธ์
      select: {
        id: true,
        userId: true,
        timestamp: true,
        imageCount: true,
        detections: true,
        images: {
          select: {
            id: true,
            filename: true,
            mimeType: true,
            originalImage: true,
            annotatedImage: true,
            predictionLogId: true
          }
        }
      }
    });

    console.log(`Found ${predictionLogs.length} prediction logs`);
    
    // Transform the data for frontend consumption
    const processedLogs = predictionLogs.map((log) => {
      console.log(`Processing log: ${log.id}`);
      
      // Parse the detections JSON
      let detections;
      try {
        detections = typeof log.detections === 'string' 
          ? JSON.parse(log.detections) 
          : log.detections || [];
      } catch (parseError) {
        console.error(`Error parsing detections for log ${log.id}:`, parseError);
        detections = [];
      }
      
      // Process images - optimized
      const processedImages = log.images.map((img, imgIndex) => {
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
      });
      
      return {
        id: log.id,
        userId: log.userId,
        timestamp: log.timestamp,
        imageCount: log.imageCount || 0,
        images: processedImages,
        detections: detections
      };
    });

    console.log("Successfully processed all logs");
    return NextResponse.json(processedLogs, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    });
  } catch (error) {
    console.error('Error fetching prediction logs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({ 
      error: 'Failed to fetch predictions', 
      message: errorMessage
    }, { status: 500 });
  }
}

// DELETE handler for deleting predictions - Optimized
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Find the user with limited select
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const { ids } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No prediction IDs provided' }, { status: 400 });
    }
    
    // Verify ownership with limited select
    const logs = await prisma.predictionLog.findMany({
      where: { id: { in: ids } },
      select: { id: true, userId: true }
    });
    
    const unauthorizedLogs = logs.filter(log => log.userId !== user.id);
    if (unauthorizedLogs.length > 0) {
      return NextResponse.json({ error: 'Unauthorized to delete some logs' }, { status: 403 });
    }
    
    // Use transaction for better performance and data integrity
    const result = await prisma.$transaction([
      // Delete images first
      prisma.predictionImage.deleteMany({
        where: { predictionLogId: { in: ids } }
      }),
      // Delete logs
      prisma.predictionLog.deleteMany({
        where: { id: { in: ids } }
      })
    ]);
    
    return NextResponse.json({ 
      success: true, 
      deleted: ids.length,
      imagesDeleted: result[0].count,
      logsDeleted: result[1].count
    });
  } catch (error) {
    console.error('Error deleting predictions:', error);
    return NextResponse.json({ error: 'Failed to delete predictions' }, { status: 500 });
  }
}