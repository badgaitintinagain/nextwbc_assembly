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
 * ข้อมูลสำหรับอัปเดตโปรไฟล์
 */
export interface UpdateUserProfileData {
  name?: string;
  email?: string;
  password?: string;
  avatar?: File;
}

/**
 * อัปเดตข้อมูลโปรไฟล์ของผู้ใช้
 * @param userId ID ของผู้ใช้
 * @param data ข้อมูลที่ต้องการอัปเดต
 * @returns ผลลัพธ์การอัปเดต
 */
export async function updateUserProfile(userId: string, data: UpdateUserProfileData) {
  try {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    if (data.password) formData.append('password', data.password);
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

/**
 * ลบบัญชีผู้ใช้
 * @param userId ID ของผู้ใช้
 * @returns ผลลัพธ์การลบ
 */
export async function deleteUser(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete user');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
