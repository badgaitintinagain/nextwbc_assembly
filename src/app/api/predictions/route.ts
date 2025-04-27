import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

// บันทึก prediction logs - ข้ามส่วนนี้ถ้ามีอยู่แล้ว
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
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // ค้นหาข้อมูลผู้ใช้
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // ดึงข้อมูล prediction logs ทั้งหมด
    const predictionLogs = await prisma.predictionLog.findMany({
      where: { userId: user.id },
      include: {
        images: true // รวมข้อมูลรูปภาพด้วย
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
    
    return NextResponse.json(predictionLogs);
  } catch (error) {
    console.error("Error fetching prediction logs:", error);
    return NextResponse.json({ error: "Failed to fetch prediction logs" }, { status: 500 });
  }
}