import fs from 'fs/promises';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: Request) {
  console.log("Upload API handler called");
  
  try {
    // ตรวจสอบการเข้าสู่ระบบ
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log("Unauthorized upload attempt");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("Processing upload for user:", session.user.email);
    
    // รับข้อมูลจาก formData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general';
    const oldImageUrl = formData.get('oldImageUrl') as string;

    if (!file) {
      console.log("No file provided in request");
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`Received file: ${file.name}, size: ${file.size}, type: ${file.type}`);
    
    // ลบรูปเก่าถ้ามี
    if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
      try {
        const oldFilePath = path.join(process.cwd(), 'public', oldImageUrl);
        console.log(`Attempting to delete old file: ${oldFilePath}`);
        
        await fs.access(oldFilePath)
          .then(() => fs.unlink(oldFilePath))
          .then(() => console.log("Old file deleted successfully"))
          .catch(err => console.log("Old file not found or could not be deleted:", err.message));
      } catch (error) {
        console.error('Error removing old file:', error);
        // Continue even if old file deletion fails
      }
    }

    // สร้างชื่อไฟล์ใหม่
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${uuidv4()}.${fileExt}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    const filePath = path.join(uploadDir, fileName);
    const fileUrl = `/uploads/${folder}/${fileName}`;

    console.log(`Will save to: ${filePath}`);
    console.log(`Public URL will be: ${fileUrl}`);

    // สร้างโฟลเดอร์ถ้ายังไม่มี
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      console.log(`Directory created/verified: ${uploadDir}`);
    } catch (error) {
      console.error('Error creating directory:', error);
      return NextResponse.json({ error: 'Failed to create upload directory' }, { status: 500 });
    }

    // อ่านข้อมูลไฟล์
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // บันทึกไฟล์
    await fs.writeFile(filePath, buffer);
    console.log(`File saved successfully: ${filePath}`);

    // ส่งข้อมูลกลับ
    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      fileName: fileName
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image', details: error.message }, 
      { status: 500 }
    );
  }
}
