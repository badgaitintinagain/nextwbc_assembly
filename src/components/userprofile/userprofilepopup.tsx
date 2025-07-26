"use client"

import { deleteUser, getUserProfile, updateUserProfile } from '@/lib/services/userService';
import { Upload, X } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import React, { useEffect, useState } from "react";

interface UserProfilePopupProps {
  user: {
    username: string;
    email: string;
    role: string;
    profileImage?: string;
  };
  onClose: () => void;
  onSave: (userData: {
    username: string;
    email: string;
    password?: string;
    profileImage?: string;
  }) => void;
}

const UserProfilePopup: React.FC<UserProfilePopupProps> = ({ user, onClose }) => {
  const { data: session } = useSession();
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState(user.profileImage || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [originalEmail] = useState(user.email);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    // Fetch latest profile (with avatar_url) when popup opens
    const userObj = session?.user as unknown as { id?: string; sub?: string };
    const userId = userObj.id || userObj.sub;
    if (userId) {
      getUserProfile(userId).then(profile => {
        if (profile.avatar_url) setPreviewImage(profile.avatar_url);
      });
    }
  }, [session]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password && password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      // next-auth session.user may not have id/sub typed, so cast to a compatible type
      const userObj = session?.user as unknown as { id?: string; sub?: string };
      const userId = userObj.id || userObj.sub;
      if (!userId) throw new Error('No user session');
      const updateFields: { name: string; email?: string; password?: string; avatar?: File } = { name: username };
      if (email !== originalEmail) updateFields.email = email;
      if (password) updateFields.password = password;
      if (profileImage) updateFields.avatar = profileImage;
      await updateUserProfile(userId, updateFields);
      setSuccess('Profile updated successfully');
      if (updateFields.email || updateFields.password) {
        setTimeout(() => {
          signOut({ callbackUrl: '/' });
        }, 1500);
      } else {
        window.location.reload();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    setLoading(true);
    setError('');
    try {
      const userId = (session?.user as unknown as { id?: string; sub?: string })?.id || (session?.user as unknown as { id?: string; sub?: string })?.sub;
      if (!userId) throw new Error('No user session');
      await deleteUser(userId);
      await signOut({ callbackUrl: '/' });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="modal-container animate-modalFadeIn" 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="modal-content w-full max-w-sm sm:max-w-md mx-2 sm:mx-4 animate-modalSlideIn" 
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          overflow: 'hidden',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative glass effect elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-4 left-4 w-12 h-12 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-sm"></div>
          <div className="absolute bottom-8 right-6 w-8 h-8 bg-gradient-to-tl from-blue-400/40 to-transparent rounded-full blur-sm"></div>
          <div className="absolute top-1/2 right-8 w-6 h-6 bg-gradient-to-br from-purple-400/30 to-transparent rounded-full blur-sm"></div>
        </div>

        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 h-2 w-full backdrop-blur-sm"></div>

        <div className="p-4 sm:p-5 relative z-10 max-h-[80vh] overflow-y-auto">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-2 sm:top-3 right-2 sm:right-3 text-white/70 hover:text-white transition-all duration-200 p-1.5 rounded-full hover:bg-white/20 backdrop-blur-sm z-20 cursor-pointer hover:scale-110"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="pr-8 mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl font-bold text-white drop-shadow-sm">Edit Profile</h2>
            <p className="text-white/70 text-xs mt-1">Update your account information</p>
          </div>
          
          {/* Alert Messages */}
          {error && (
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 p-3 rounded-xl mb-4 text-xs flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-green-200 p-3 rounded-xl mb-4 text-xs flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{success}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Profile Image */}
            <div className="flex flex-col items-center space-y-2 sm:space-y-3">
              <div className="relative">
                <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg flex items-center justify-center">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-white/70 uppercase text-lg sm:text-xl font-semibold">{username.charAt(0)}</div>
                  )}
                </div>
                {/* Decorative ring */}
                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-sm -z-10"></div>
              </div>
              <label className="flex items-center gap-1.5 sm:gap-2 text-xs text-blue-300 cursor-pointer bg-white/10 backdrop-blur-sm border border-white/20 px-2.5 sm:px-3 py-1.5 rounded-full hover:bg-white/20 transition-all duration-200">
                <Upload size={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="text-xs">Upload Photo</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {/* Username */}
            <div className="space-y-1 sm:space-y-1.5">
              <label className="block text-xs font-medium text-white/90">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 text-sm"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1 sm:space-y-1.5">
              <label className="block text-xs font-medium text-white/90">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 sm:py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white/60 cursor-not-allowed text-sm"
                disabled
              />
              <p className="text-white/60 text-xs">Email cannot be changed</p>
            </div>

            {/* New Password */}
            <div className="space-y-1 sm:space-y-1.5">
              <label className="block text-xs font-medium text-white/90">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 text-sm"
                placeholder="Leave blank to keep current password"
              />
            </div>

            {/* Confirm Password */}
            {password && (
              <div className="space-y-1 sm:space-y-1.5 animate-fadeIn">
                <label className="block text-xs font-medium text-white/90">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 text-sm"
                  placeholder="Confirm your new password"
                  required={!!password}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 pt-3 sm:pt-4">
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 text-xs text-red-300 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all duration-200 disabled:opacity-50 w-full sm:w-auto"
                disabled={loading}
              >
                Delete Account
              </button>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-3 py-2 text-xs text-white/80 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 sm:flex-none px-4 py-2 text-xs text-white font-medium rounded-xl transition-all duration-300 ${
                    loading 
                      ? "bg-blue-400/50 cursor-not-allowed backdrop-blur-sm" 
                      : "bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-600/90 hover:to-purple-600/90 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105"
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePopup;