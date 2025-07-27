import prisma, { handlePrismaQuery } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { id: userId } = resolvedParams;

        // ตรวจสอบว่าเป็นการขอข้อมูลของตัวเองหรือไม่
        if ((session.user as unknown as { id: string; role: string }).id !== userId && (session.user as unknown as { id: string; role: string }).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // ดึงข้อมูลผู้ใช้พร้อมรูปโปรไฟล์
        let user;
        try {
            user = await handlePrismaQuery(() => 
                prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        name: true,
                        email: true,
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
                })
            );
        } catch (prismaError) {
            console.error('Prisma error fetching user:', prismaError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

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
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        console.log("🔍 [USER API] PATCH /api/users/[id] started");
        
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            console.log("❌ [USER API] Unauthorized - no session");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const resolvedParams = await params;
        const userId = resolvedParams.id;
        console.log("🔍 [USER API] User ID:", userId);
        
        if ((session.user as unknown as { id: string; role: string }).id !== userId && (session.user as unknown as { id: string; role: string }).role !== 'ADMIN') {
            console.log("❌ [USER API] Forbidden - not owner or admin");
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        
        console.log("🔍 [USER API] Parsing form data...");
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const avatarFile = formData.get('avatar') as File;
        
        console.log("🔍 [USER API] Form data parsed:", {
            name: name ? "provided" : "not provided",
            email: email ? "provided" : "not provided", 
            password: password ? "provided" : "not provided",
            avatar: avatarFile ? `${avatarFile.name} (${avatarFile.size} bytes)` : "not provided"
        });
        const updateData: any = {};
        if (name && name.trim() !== '') updateData.name = name;
        if (email && email.trim() !== '') updateData.email = email;
        if (password && password.trim() !== '') {
            const hashed = await bcrypt.hash(password, 10);
            updateData.password = hashed;
        }
        
        console.log("🔍 [USER API] Update data:", Object.keys(updateData));
        
        // อัพเดตข้อมูลผู้ใช้ด้วย handlePrismaQuery
        console.log("🔍 [USER API] Updating user data...");
        const updatedUser = await handlePrismaQuery(() =>
            prisma.user.update({
                where: { id: userId },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            })
        );

        if (!updatedUser) {
            console.error("❌ [USER API] Failed to update user data");
            return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 });
        }
        
        console.log("✅ [USER API] User data updated successfully");
        let avatarUrl = '';
        if (avatarFile) {
            // ลบรูปโปรไฟล์เก่า
            await handlePrismaQuery(() =>
                prisma.userImage.deleteMany({ 
                    where: { userId: userId, isProfile: true } 
                })
            );
            
            const buffer = Buffer.from(await avatarFile.arrayBuffer());
            
            // สร้างรูปโปรไฟล์ใหม่
            const newProfileImage = await handlePrismaQuery(() =>
                prisma.userImage.create({
                    data: {
                        userId: userId,
                        imageData: buffer,
                        mimeType: avatarFile.type,
                        filename: avatarFile.name,
                        isProfile: true
                    }
                })
            );
            
            if (newProfileImage) {
                avatarUrl = `data:${newProfileImage.mimeType};base64,${buffer.toString('base64')}`;
            }
        } else {
            // ดึงรูปโปรไฟล์ที่มีอยู่
            const existingImage = await handlePrismaQuery(() =>
                prisma.userImage.findFirst({ 
                    where: { userId: userId, isProfile: true } 
                })
            );
            
            if (existingImage) {
                avatarUrl = `data:${existingImage.mimeType};base64,${Buffer.from(existingImage.imageData).toString('base64')}`;
            }
        }
        return NextResponse.json({ ...updatedUser, avatarUrl });
    } catch (error: unknown) {
        console.error('Error updating user:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: `Failed to update user data: ${error.message}` }, { status: 500 });
        }
        return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 });
    }
}
