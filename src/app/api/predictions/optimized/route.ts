import prisma, { handlePrismaQuery } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

// Optimized version - เก็บ images แต่ทำทีละ chunk เพื่อหลีกเลี่ยง memory issues
export async function POST(request: Request) {
  console.log("🔍 [OPTIMIZED API] POST /api/predictions/optimized started");
  
  const session = await getServerSession(authOptions);
  console.log("🔍 [OPTIMIZED API] Session check:", session?.user?.email ? "authenticated" : "not authenticated");
  
  if (!session?.user?.email) {
    console.log("❌ [OPTIMIZED API] Unauthorized - no session");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    console.log("🔍 [OPTIMIZED API] Parsing form data...");
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const detectionsString = formData.get('detections') as string;
    
    console.log("🔍 [OPTIMIZED API] Files count:", files.length);
    console.log("🔍 [OPTIMIZED API] Detections string length:", detectionsString?.length || 0);
    
    let detections;
    try {
      detections = JSON.parse(detectionsString);
      console.log("🔍 [OPTIMIZED API] Parsed detections:", detections.length);
    } catch (parseError) {
      console.error("❌ [OPTIMIZED API] Error parsing detections:", parseError);
      return NextResponse.json({ error: "Invalid detections format" }, { status: 400 });
    }
    
    // ค้นหาข้อมูลผู้ใช้
    console.log("🔍 [OPTIMIZED API] Finding user:", session.user.email);
    const user = await handlePrismaQuery(async () => {
      return await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { id: true }
      });
    });
    
    if (!user) {
      console.log("❌ [OPTIMIZED API] User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    console.log("🔍 [OPTIMIZED API] User found:", user.id);
    
    // สร้าง log entry ใหม่
    console.log("🔍 [OPTIMIZED API] Creating prediction log...");
    const predictionLog = await handlePrismaQuery(async () => {
      return await prisma.predictionLog.create({
        data: {
          userId: user.id,
          imageCount: files.length,
          detections: detections
        },
        select: { id: true }
      });
    });
    
    if (!predictionLog) {
      console.log("❌ [OPTIMIZED API] Failed to create prediction log");
      return NextResponse.json({ error: "Failed to create prediction log" }, { status: 500 });
    }
    
    console.log("✅ [OPTIMIZED API] Prediction log created:", predictionLog.id);
    
    // ประมวลผลรูปภาพทีละรูป เพื่อลด memory usage
    console.log("🔍 [OPTIMIZED API] Processing images one by one...");
    let processedCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];
        const annotatedFileData = formData.get(`annotated_${i}`) as File;
        
        console.log(`🔍 [OPTIMIZED API] Processing image ${i + 1}/${files.length}: ${file.name}`);
        
        // ตรวจสอบขนาดไฟล์ก่อน
        const maxFileSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxFileSize) {
          console.warn(`⚠️ [OPTIMIZED API] File ${file.name} too large (${file.size} bytes), skipping...`);
          continue;
        }
        
        const originalBuffer = Buffer.from(await file.arrayBuffer());
        let annotatedBuffer = null;
        
        if (annotatedFileData) {
          console.log(`🔍 [OPTIMIZED API] Processing annotated image ${i}`);
          if (annotatedFileData.size <= maxFileSize) {
            annotatedBuffer = Buffer.from(await annotatedFileData.arrayBuffer());
          } else {
            console.warn(`⚠️ [OPTIMIZED API] Annotated file too large, skipping annotated version...`);
          }
        }
        
        // บันทึกรูปภาพทีละรูป
        const imageResult = await handlePrismaQuery(async () => {
          return await prisma.predictionImage.create({
            data: {
              predictionLogId: predictionLog.id,
              originalImage: originalBuffer,
              annotatedImage: annotatedBuffer,
              mimeType: file.type,
              filename: file.name
            },
            select: { id: true }
          });
        });
        
        if (imageResult) {
          processedCount++;
          console.log(`✅ [OPTIMIZED API] Image ${i + 1} saved successfully`);
        } else {
          console.warn(`⚠️ [OPTIMIZED API] Failed to save image ${i + 1}`);
        }
        
        // เพิ่มการหยุดพักเล็กน้อยระหว่างการประมวลผล
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (imageError) {
        console.error(`❌ [OPTIMIZED API] Error processing image ${i + 1}:`, imageError);
        // ไม่ throw error เพื่อให้ประมวลผลรูปอื่นต่อไป
      }
    }
    
    console.log(`✅ [OPTIMIZED API] Successfully processed ${processedCount}/${files.length} images`);
    
    return NextResponse.json({ 
      success: true, 
      predictionId: predictionLog.id,
      processedImages: processedCount,
      totalImages: files.length,
      message: `Prediction saved with ${processedCount} images`
    }, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
    
  } catch (error) {
    console.error("❌ [OPTIMIZED API] Error saving prediction:", error);
    return NextResponse.json({ 
      error: "Failed to save prediction", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
