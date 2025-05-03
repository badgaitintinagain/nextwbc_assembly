// src/lib/services/imageService.js
import { supabase } from '../supabase';

// อัปโหลดรูปภาพไปยัง Supabase Storage
export async function uploadImage(file, bucket = 'images', folder = '') {
  const fileName = `${folder ? folder + '/' : ''}${Date.now()}_${file.name}`;
  
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  // สร้าง URL สาธารณะสำหรับรูปภาพ
  const { data: publicURL } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    path: data.path,
    url: publicURL.publicUrl
  };
}

// ดึงรูปภาพจาก Supabase Storage
export async function getImages(bucket = 'images', folder = '') {
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .list(folder, {
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (error) {
    console.error('Error fetching images:', error);
    throw error;
  }

  // เพิ่ม URL สำหรับแต่ละรูปภาพ
  const imagesWithUrls = data.map(item => {
    const { data: publicURL } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(folder ? `${folder}/${item.name}` : item.name);
    
    return {
      ...item,
      url: publicURL.publicUrl
    };
  });

  return imagesWithUrls;
}

// ลบรูปภาพจาก Supabase Storage
export async function deleteImage(path, bucket = 'images') {
  const { error } = await supabase
    .storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
    throw error;
  }

  return { success: true };
}