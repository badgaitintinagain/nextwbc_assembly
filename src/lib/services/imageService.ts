/**
 * อัปโหลดรูปภาพไปยัง server
 * @param file ไฟล์รูปภาพที่ต้องการอัปโหลด
 * @param folder โฟลเดอร์ที่จะเก็บรูปภาพ (เช่น 'avatars', 'posts', etc.)
 * @returns ข้อมูลที่ได้รับจากการอัปโหลด
 */
export async function uploadImage(file: File, folder: string): Promise<{ url: string, success: boolean }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Image upload failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}
