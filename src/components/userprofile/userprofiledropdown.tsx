"use client"

import { LogOut, Shield, UserCog } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface UserProfileDropdownProps {
  user: {
    username: string;
    email: string;
    role: string;
  };
  onSignOut: () => void;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ user, onSignOut }) => {
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
      <div className="px-4 py-2 border-b border-gray-100">
        <p className="font-medium text-sm">{user.username}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
        <p className="text-xs mt-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
          }`}>
            {user.role}
          </span>
        </p>
      </div>
      
      <Link href="/profile/edit" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
        <UserCog className="mr-2" size={16} />
        Edit Profile
      </Link>
      
      {isAdmin && (
        <Link href="/admin/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
          <Shield className="mr-2" size={16} />
          Admin Dashboard
        </Link>
      )}
      
      <button 
        onClick={onSignOut}
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
      >
        <LogOut className="mr-2" size={16} />
        Sign out
      </button>
    </div>
  );
};

export default UserProfileDropdown;