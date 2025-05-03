import { authOptions } from '@/app/api/auth/authOptions';
import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // ตรวจสอบการล็อกอิน
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'คุณไม่ได้ล็อกอิน' }, { status: 401 });
    }

    // ดึงข้อมูลรูปภาพของผู้ใช้
    const { data, error } = await supabase
      .from('user_images')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching images:', error);
      return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพ' }, { status: 500 });
    }

    return NextResponse.json({ images: data });
  } catch (e) {
    console.error('Error in GET images:', e);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // ตรวจสอบการล็อกอิน
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'คุณไม่ได้ล็อกอิน' }, { status: 401 });
    }

    // รับข้อมูล FormData จาก request
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const description = formData.get('description') || '';
    
    if (!imageFile) {
      return NextResponse.json({ error: 'ไม่มีไฟล์รูปภาพ' }, { status: 400 });
    }

    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const fileName = `${session.user.id}_${Date.now()}_${imageFile.name}`;
    
    // อัปโหลดไฟล์ไปยัง Supabase Storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('user-images')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (fileError) {
      console.error('Error uploading file:', fileError);
      return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' }, { status: 500 });
    }

    // สร้าง URL สาธารณะ
    const { data: publicUrl } = supabase
      .storage
      .from('user-images')
      .getPublicUrl(fileName);

    // บันทึกข้อมูลลงในฐานข้อมูล
    const { data, error } = await supabase
      .from('user_images')
      .insert([{
        user_id: session.user.id,
        file_path: fileName,
        url: publicUrl.publicUrl,
        description,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Error saving image data:', error);
      return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลรูปภาพ' }, { status: 500 });
    }

    return NextResponse.json({ success: true, image: data[0] });
  } catch (e) {
    console.error('Error in POST image:', e);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' }, { status: 500 });
  }
}