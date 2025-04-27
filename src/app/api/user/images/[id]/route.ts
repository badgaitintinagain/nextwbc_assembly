import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const imageId = params.id;
    
    // ดึงข้อมูลรูปภาพจากฐานข้อมูล
    const userImage = await prisma.userImage.findUnique({
      where: { id: imageId }
    });
    
    if (!userImage) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    
    // สร้าง Response ที่มี Content-Type ตรงกับประเภทของรูปภาพ
    return new NextResponse(userImage.imageData, {
      headers: {
        'Content-Type': userImage.mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache 1 year
      }
    });
    
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}