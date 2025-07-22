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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
        {error && (
          <div className="bg-red-50 text-red-500 px-4 py-2 rounded mb-4 text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-2 rounded mb-4 text-sm">{success}</div>
        )}
        <form onSubmit={handleSubmit}>
          {/* Profile Image */}
          <div className="mb-5 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-2 bg-gray-100 flex items-center justify-center border border-gray-200">
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400 uppercase text-xl">{username.charAt(0)}</div>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer">
              <Upload size={16} />
              <span>Upload Photo</span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
          {/* Username */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled
            />
          </div>
          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Confirm Password */}
          {password && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!!password}
              />
            </div>
          )}
          <div className="flex justify-between gap-2 mt-6">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
              disabled={loading}
            >
              Delete Account
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfilePopup;