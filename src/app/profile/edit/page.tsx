'use client';

import { getUserProfile } from '@/lib/services/userService';
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (session?.user?.email) {
      loadUserProfile();
    }
  }, [session]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      if (!session?.user?.email) return;
      
      const userData = await getUserProfile(session.user.email);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPreviewUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!session?.user?.email) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }

      // ใช้ FormData สำหรับส่งข้อมูลรูปภาพ
      const formData = new FormData();
      
      // เพิ่มข้อมูลทั่วไป
      formData.append('name', profile.name);
      formData.append('bio', profile.bio);
      
      // เพิ่มรูปภาพถ้ามีการอัปโหลดใหม่
      if (imageFile) {
        console.log("Adding image file to form data:", imageFile.name);
        formData.append('avatar', imageFile);
      }
      
      // ส่งข้อมูลโปรไฟล์ไปอัปเดต
      console.log("Updating user profile...");
      const response = await fetch(`/api/users/${session.user.email}`, {
        method: 'PATCH',
        body: formData, // ใช้ FormData แทน JSON
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      const updatedUser = await response.json();
      console.log("Profile updated successfully:", updatedUser);
      
      // อัปเดตข้อมูลโปรไฟล์ในหน้า
      setProfile({
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        bio: updatedUser.bio || '',
        avatarUrl: updatedUser.avatarUrl || ''
      });
      
      // รีเซ็ตค่าหลังจากอัปเดตสำเร็จ
      setImageFile(null);
      setPreviewUrl('');
      setMessage('อัปเดตโปรไฟล์สำเร็จ');
      
      // โหลดข้อมูลใหม่จากเซิร์ฟเวอร์
      await loadUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      setMessage(`เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile.name) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background video or gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        
        <div className="relative z-10 container mx-auto p-8 flex items-center justify-center min-h-screen">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl animate-fadeIn" style={{
            backdropFilter: 'blur(15px)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <div className="flex items-center justify-center space-x-3">
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-white text-lg">กำลังโหลด...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
      
      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
      
      <div className="relative z-10 container mx-auto p-8 max-w-2xl">
        {/* Glass morphism header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl animate-fadeIn" style={{
          backdropFilter: 'blur(15px)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">แก้ไขโปรไฟล์</h1>
            <p className="text-white/70 drop-shadow-sm">ปรับแต่งข้อมูลส่วนตัวของคุณ</p>
          </div>
        </div>
      
      {message && (
        <div className={`bg-white/10 backdrop-blur-xl border rounded-3xl p-6 mb-8 shadow-2xl animate-fadeIn ${message.includes('สำเร็จ') 
          ? 'border-green-400/30 bg-green-500/10' 
          : 'border-red-400/30 bg-red-500/10'
        }`} style={{
          backdropFilter: 'blur(15px)',
          background: message.includes('สำเร็จ') 
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <div className="flex items-center space-x-3">
            {message.includes('สำเร็จ') ? (
              <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className={`drop-shadow-sm ${message.includes('สำเร็จ') ? 'text-green-200' : 'text-red-200'}`}>
              {message}
            </span>
          </div>
        </div>
      )}
      
      {/* Glass morphism form container */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl animate-fadeIn" style={{
        backdropFilter: 'blur(15px)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Section */}
          <div className="space-y-3">
            <label className="block text-white font-medium drop-shadow-sm">รูปโปรไฟล์</label>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
                  {(previewUrl || profile.avatarUrl) ? (
                    <img 
                      src={previewUrl || profile.avatarUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Decorative ring */}
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-sm -z-10"></div>
              </div>
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="block w-full text-sm text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-white/10 file:backdrop-blur-sm file:text-white hover:file:bg-white/20 file:transition-all file:duration-200 cursor-pointer"
                />
                <p className="text-white/60 text-xs mt-2">PNG, JPG หรือ GIF ขนาดไม่เกิน 5MB</p>
              </div>
            </div>
          </div>
          
          {/* Name Field */}
          <div className="space-y-2">
            <label className="block text-white font-medium drop-shadow-sm">ชื่อ</label>
            <input 
              type="text" 
              value={profile.name} 
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
              placeholder="กรอกชื่อของคุณ"
            />
          </div>
          
          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-white font-medium drop-shadow-sm">อีเมล</label>
            <input 
              type="email" 
              value={profile.email} 
              disabled
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white/60 cursor-not-allowed"
            />
            <p className="text-white/60 text-sm">ไม่สามารถแก้ไขอีเมลได้</p>
          </div>
          
          {/* Bio Field */}
          <div className="space-y-2">
            <label className="block text-white font-medium drop-shadow-sm">เกี่ยวกับฉัน</label>
            <textarea 
              value={profile.bio} 
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 h-32 resize-none"
              placeholder="เล่าเกี่ยวกับตัวคุณ..."
            />
          </div>
          
          {/* Submit Button */}
          <div className="pt-4">
            <button 
              type="submit" 
              className={`w-full py-3 px-6 rounded-2xl text-white font-medium transition-all duration-300 transform active:scale-95 ${
                loading 
                  ? "bg-blue-400/50 cursor-not-allowed backdrop-blur-sm" 
                  : "bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-600/90 hover:to-purple-600/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105"
              }`}
              disabled={loading}
              onMouseDown={(e) => e.currentTarget.classList.add('animate-buttonPulse')}
              onAnimationEnd={(e) => e.currentTarget.classList.remove('animate-buttonPulse')}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังบันทึก...
                </span>
              ) : (
                'บันทึกการเปลี่ยนแปลง'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}