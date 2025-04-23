"use client"

import { Upload, X } from 'lucide-react';
import React, { useState } from "react";

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

const UserProfilePopup: React.FC<UserProfilePopupProps> = ({ user, onClose, onSave }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(user.profileImage || '');
  const [previewImage, setPreviewImage] = useState(user.profileImage || '');
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setProfileImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (password && password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    // Create updated user data object
    const updatedData = {
      username,
      email,
      ...(password ? { password } : {}),
      ...(profileImage ? { profileImage } : {})
    };
    
    // Call the onSave function with the updated data
    onSave(updatedData);
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
          <div className="bg-red-50 text-red-500 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Profile Image */}
          <div className="mb-5 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-2 bg-gray-100 flex items-center justify-center border border-gray-200">
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400 uppercase text-xl">
                  {username.charAt(0)}
                </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password (leave blank to keep current)
            </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!!password}
              />
            </div>
          )}
          
          {/* Submit Button */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfilePopup;