import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;

    // ตรวจสอบว่าเป็นการขอข้อมูลของตัวเองหรือไม่
    if (session.user.id !== userId && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ดึงข้อมูลผู้ใช้พร้อมรูปโปรไฟล์
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        role: true,
        createdAt: true,
        userImages: {
          where: { isProfile: true },
          select: {
            id: true,
            mimeType: true,
            filename: true,
            imageData: true
          },
          take: 1
        }
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ถ้ามีรูปโปรไฟล์ ให้แปลงเป็น base64 URL สำหรับส่งกลับไปที่ client
    let avatarUrl = '';
    if (user.userImages && user.userImages.length > 0) {
      const profileImage = user.userImages[0];
      const base64Image = Buffer.from(profileImage.imageData).toString('base64');
      avatarUrl = `data:${profileImage.mimeType};base64,${base64Image}`;
    }

    // ส่งข้อมูลกลับไปโดยไม่รวม userImages แต่เพิ่ม avatarUrl
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      role: user.role,
      createdAt: user.createdAt,
      avatar_url: avatarUrl
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}

// ฟังก์ชันสำหรับอัปเดตข้อมูลผู้ใช้
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("User update API called");
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;

    // ตรวจสอบว่าเป็นการอัปเดตของตัวเองหรือไม่
    if (session.user.id !== userId && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // รับข้อมูลจาก formData
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const avatarFile = formData.get('avatar') as File;

    console.log(`Updating user ${userId} - Name: ${name}, Bio length: ${bio?.length || 0}`);
    if (avatarFile) {
      console.log(`New avatar file: ${avatarFile.name}, size: ${avatarFile.size}, type: ${avatarFile.type}`);
    }

    // เตรียมข้อมูลสำหรับอัปเดตผู้ใช้
    const updateData: any = {
      name,
      bio
    };

    // อัปเดตข้อมูลผู้ใช้
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
      },
    });

    // ถ้ามีการอัปโหลดรูปโปรไฟล์ใหม่
    let avatarUrl = '';
    if (avatarFile) {
      // ลบรูปโปรไฟล์เก่า (ถ้ามี)
      await prisma.userImage.deleteMany({
        where: {
          userId: userId,
          isProfile: true
        }
      });

      // อ่านข้อมูลไฟล์
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      
      // บันทึกรูปโปรไฟล์ใหม่
      const newProfileImage = await prisma.userImage.create({
        data: {
          userId: userId,
          imageData: buffer,
          mimeType: avatarFile.type,
          filename: avatarFile.name,
          isProfile: true
        }
      });
      
      // แปลงเป็น data URL สำหรับส่งกลับไปที่ client
      avatarUrl = `data:${newProfileImage.mimeType};base64,${buffer.toString('base64')}`;
      console.log("New profile image saved to database");
    } else {
      // ถ้าไม่มีการอัปโหลดรูปใหม่ ให้ดึงรูปเก่า (ถ้ามี)
      const existingImage = await prisma.userImage.findFirst({
        where: {
          userId: userId,
          isProfile: true
        }
      });
      
      if (existingImage) {
        avatarUrl = `data:${existingImage.mimeType};base64,${Buffer.from(existingImage.imageData).toString('base64')}`;
      }
    }

    // ส่งข้อมูลกลับพร้อม URL ของรูปโปรไฟล์
    return NextResponse.json({
      ...updatedUser,
      avatarUrl
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: `Failed to update user data: ${error.message}` },
      { status: 500 }
    );
  }
}
