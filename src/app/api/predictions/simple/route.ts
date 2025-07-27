import prisma, { handlePrismaQuery } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

// Simplified version - เก็บแค่ metadata ไม่เก็บ images
export async function POST(request: Request) {
  console.log("🔍 [SIMPLE API] POST /api/predictions/simple started");
  
  const session = await getServerSession(authOptions);
  console.log("🔍 [SIMPLE API] Session check:", session?.user?.email ? "authenticated" : "not authenticated");
  
  if (!session?.user?.email) {
    console.log("❌ [SIMPLE API] Unauthorized - no session");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    console.log("🔍 [SIMPLE API] Parsing form data...");
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const detectionsString = formData.get('detections') as string;
    
    console.log("🔍 [SIMPLE API] Files count:", files.length);
    console.log("🔍 [SIMPLE API] Detections string length:", detectionsString?.length || 0);
    
    let detections;
    try {
      detections = JSON.parse(detectionsString);
      console.log("🔍 [SIMPLE API] Parsed detections:", detections.length);
    } catch (parseError) {
      console.error("❌ [SIMPLE API] Error parsing detections:", parseError);
      return NextResponse.json({ error: "Invalid detections format" }, { status: 400 });
    }
    
    // ค้นหาข้อมูลผู้ใช้
    console.log("🔍 [SIMPLE API] Finding user:", session.user.email);
    const user = await handlePrismaQuery(async () => {
      return await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { id: true }
      });
    });
    
    if (!user) {
      console.log("❌ [SIMPLE API] User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    console.log("🔍 [SIMPLE API] User found:", user.id);
    
    // สร้าง log entry ใหม่ - ไม่เก็บ images
    console.log("🔍 [SIMPLE API] Creating prediction log...");
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
      console.log("❌ [SIMPLE API] Failed to create prediction log");
      return NextResponse.json({ error: "Failed to create prediction log" }, { status: 500 });
    }
    
    console.log("✅ [SIMPLE API] Prediction log created:", predictionLog.id);
    console.log("✅ [SIMPLE API] Prediction saved successfully (metadata only)");
    
    return NextResponse.json({ 
      success: true, 
      predictionId: predictionLog.id,
      message: "Prediction metadata saved (images not stored)"
    }, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
    
  } catch (error) {
    console.error("❌ [SIMPLE API] Error saving prediction:", error);
    console.error("❌ [SIMPLE API] Error stack:", error instanceof Error ? error.stack : String(error));
    return NextResponse.json({ 
      error: "Failed to save prediction", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
