/**
 * เรียกดูข้อมูลโปรไฟล์ของผู้ใช้
 * @param userId ID ของผู้ใช้
 * @returns ข้อมูลผู้ใช้
 */
export async function getUserProfile(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * อัปเดตข้อมูลโปรไฟล์ของผู้ใช้
 * @param userId ID ของผู้ใช้
 * @param data ข้อมูลที่ต้องการอัปเดต
 * @returns ผลลัพธ์การอัปเดต
 */
export async function updateUserProfile(userId: string, data: any) {
  try {
    // ใช้ FormData ในการส่งข้อมูล
    const formData = new FormData();
    
    // เพิ่มข้อมูลพื้นฐาน
    formData.append('name', data.name || '');
    formData.append('bio', data.bio || '');
    
    // ถ้ามีไฟล์รูปภาพ
    if (data.avatar && data.avatar instanceof File) {
      formData.append('avatar', data.avatar);
    }
    
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}
