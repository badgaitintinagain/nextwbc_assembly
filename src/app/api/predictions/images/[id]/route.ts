import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // ใช้ destructuring เพื่อดึงค่า id
    const { id } = params;
    const imageId = id;
    
    const type = new URL(request.url).searchParams.get('type') || 'original';
    
    // ดึงข้อมูลรูปภาพจากฐานข้อมูล
    const predictionImage = await prisma.predictionImage.findUnique({
      where: { id: imageId },
      include: {
        predictionLog: true
      }
    });
    
    if (!predictionImage) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    
    // ตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงรูปภาพนี้หรือไม่
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user || predictionImage.predictionLog.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to this image" }, { status: 403 });
    }
    
    // เลือกว่าจะแสดงรูปต้นฉบับหรือรูปที่มีการ annotate
    const imageData = type === 'annotated' && predictionImage.annotatedImage 
      ? predictionImage.annotatedImage 
      : predictionImage.originalImage;
    
    if (!imageData) {
      return NextResponse.json({ error: "Image data not found" }, { status: 404 });
    }
    
    // สร้าง response พร้อม content type ที่เหมาะสม
    return new NextResponse(imageData, {
      headers: {
        'Content-Type': predictionImage.mimeType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache 1 ปี
      },
    });
    
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}