import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const isProfile = formData.get('isProfile') === 'true';
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    // ค้นหาข้อมูลผู้ใช้
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // อ่านข้อมูลไฟล์เป็น ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // ถ้าเป็นรูปโปรไฟล์ ให้ยกเลิกการตั้งค่ารูปอื่นเป็นรูปโปรไฟล์
    if (isProfile) {
      await prisma.userImage.updateMany({
        where: { 
          userId: user.id,
          isProfile: true 
        },
        data: { isProfile: false }
      });
    }
    
    // บันทึกข้อมูลรูปภาพ
    const userImage = await prisma.userImage.create({
      data: {
        userId: user.id,
        imageData: buffer,
        mimeType: file.type,
        filename: file.name,
        isProfile
      }
    });
    
    // ถ้าเป็นรูปโปรไฟล์ อัปเดต user.image ด้วย
    if (isProfile) {
      await prisma.user.update({
        where: { id: user.id },
        data: { image: `/api/user/images/${userImage.id}` } // URL สำหรับดึงรูปภาพ
      });
    }
    
    return NextResponse.json({
      id: userImage.id,
      filename: userImage.filename,
      isProfile: userImage.isProfile,
      createdAt: userImage.createdAt
    });
    
  } catch (error) {
    console.error("Error uploading user image:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}