"use client"

import { LogOut, Shield, UserCog } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import UserProfilePopup from './userprofilepopup';

interface UserProfileDropdownProps {
  user: {
    username: string;
    email: string;
    role: string;
    profileImage?: string;
  };
  onSignOut: () => void;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ user, onSignOut }) => {
  const isAdmin = user.role === "ADMIN";
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  const handleEditProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowProfilePopup(true);
  };

  const handleSaveProfile = async (userData: {
    username: string;
    email: string;
    password?: string;
    profileImage?: string;
  }) => {
    try {
      // Here you would make an API call to update the user profile
      // Example:
      // await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData)
      // });
      
      console.log('Profile updated:', userData);
      setShowProfilePopup(false);
      
      // You might want to refresh the user data or session after updating
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <>
      <div className="absolute top-full right-0 mt-1 w-52 bg-black/60 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden animate-fadeIn" style={{
        backdropFilter: 'blur(15px)',
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.8) 100%)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        transform: 'translateY(-5px)',
        animation: 'slideDown 0.2s ease-out forwards'
      }}>
        {/* Decorative glass effect elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-2 left-2 w-8 h-8 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-sm"></div>
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-gradient-to-tl from-blue-400/50 to-transparent rounded-full blur-sm"></div>
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-gradient-to-br from-purple-400/40 to-transparent rounded-full blur-sm transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="px-4 py-3 border-b border-white/30 relative z-10 bg-black/20 backdrop-blur-sm rounded-t-xl">
          <p className="font-medium text-sm text-white drop-shadow-sm">{user.username}</p>
          <p className="text-xs text-white/80 drop-shadow-sm">{user.email}</p>
          <p className="text-xs mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${
              isAdmin 
                ? 'bg-purple-500/50 text-purple-100 border border-purple-400/50' 
                : 'bg-green-500/50 text-green-100 border border-green-400/50'
            }`}>
              {user.role}
            </span>
          </p>
        </div>
        
        <button 
          onClick={handleEditProfile}
          className="flex items-center px-4 py-2.5 text-sm text-white hover:bg-white/20 w-full text-left transition-all duration-300 hover:backdrop-blur-sm rounded-xl mx-2 my-1 group hover:translate-x-1"
        >
          <UserCog className="mr-3 group-hover:scale-110 transition-transform duration-200" size={16} />
          <span className="drop-shadow-sm">Edit Profile</span>
        </button>
        
        {isAdmin && (
          <Link href="/admin/dashboard" className="flex items-center px-4 py-2.5 text-sm text-white hover:bg-white/20 w-full text-left transition-all duration-300 hover:backdrop-blur-sm rounded-xl mx-2 my-1 group hover:translate-x-1">
            <Shield className="mr-3 group-hover:scale-110 transition-transform duration-200" size={16} />
            <span className="drop-shadow-sm">Admin Dashboard</span>
          </Link>
        )}
        
        <button 
          onClick={onSignOut}
          className="flex items-center px-4 py-2.5 text-sm text-red-200 hover:bg-red-500/30 w-full text-left transition-all duration-300 hover:backdrop-blur-sm rounded-xl mx-2 my-1 group hover:translate-x-1"
        >
          <LogOut className="mr-3 group-hover:scale-110 transition-transform duration-200" size={16} />
          <span className="drop-shadow-sm">Sign out</span>
        </button>
      </div>

      {showProfilePopup && (
        <UserProfilePopup 
          user={user} 
          onClose={() => setShowProfilePopup(false)}
          onSave={handleSaveProfile}
        />
      )}
    </>
  );
};

export default UserProfileDropdown;