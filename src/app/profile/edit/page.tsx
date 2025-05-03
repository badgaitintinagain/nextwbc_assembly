'use client';

import { uploadImage } from '@/lib/services/imageService';
import { getUserProfile, updateUserProfile } from '@/lib/services/userService';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function EditProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    avatarUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (session?.user?.id) {
      loadUserProfile();
    }
  }, [session]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await getUserProfile(session.user.id);
      setProfile({
        name: userData.name || '',
        email: userData.email || '',
        bio: userData.bio || '',
        avatarUrl: userData.avatar_url || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let avatarUrl = profile.avatarUrl;
      
      // อัปโหลดรูปภาพใหม่ถ้ามี
      if (imageFile) {
        const imageData = await uploadImage(imageFile, 'avatars');
        avatarUrl = imageData.url;
      }

      // อัปเดตข้อมูลผู้ใช้
      await updateUserProfile(session.user.id, {
        name: profile.name,
        bio: profile.bio,
        avatar_url: avatarUrl
      });

      setMessage('อัปเดตโปรไฟล์สำเร็จ');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile.name) {
    return <div className="container mx-auto p-4">กำลังโหลด...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">แก้ไขโปรไฟล์</h1>
      
      {message && (
        <div className={`p-4 mb-4 rounded ${message.includes('สำเร็จ') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label className="block mb-2">รูปโปรไฟล์</label>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
              {(previewUrl || profile.avatarUrl) && (
                <img 
                  src={previewUrl || profile.avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="text-sm"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">ชื่อ</label>
          <input 
            type="text" 
            value={profile.name} 
            onChange={(e) => setProfile({...profile, name: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">อีเมล</label>
          <input 
            type="email" 
            value={profile.email} 
            disabled
            className="w-full p-2 border rounded bg-gray-100"
          />
          <p className="text-sm text-gray-500 mt-1">ไม่สามารถแก้ไขอีเมลได้</p>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">เกี่ยวกับฉัน</label>
          <textarea 
            value={profile.bio} 
            onChange={(e) => setProfile({...profile, bio: e.target.value})}
            className="w-full p-2 border rounded h-32"
          />
        </div>
        
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
        </button>
      </form>
    </div>
  );
}