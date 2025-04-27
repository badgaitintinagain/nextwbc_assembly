"use client"

import AuthModal from "@/components/AuthModal"; // เพิ่ม import
import { UserIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import UserProfileDropdown from "./userprofile/userprofiledropdown";

const Header = () => {
    const { data: session, status } = useSession();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // เพิ่ม state สำหรับ AuthModal
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");
    
    // Add debugging
    console.log("Session status:", status);
    console.log("Session data:", session);
    
    const isAuthenticated = status === "authenticated";
    
    // Use actual user data if authenticated, mock data otherwise
    const user = isAuthenticated ? {
        username: session?.user?.name || "User",
        email: session?.user?.email || "",
        role: session?.user?.role || "USER"
    } : {
        username: "Guest",
        email: "",
        role: ""
    };

    const handleSignOut = () => {
        signOut({ callbackUrl: "/" });
    };
    
    // เพิ่มฟังก์ชันสำหรับเปิด Modal
    const openSignInModal = () => {
        setAuthModalMode("signin");
        setIsAuthModalOpen(true);
    };

    const openSignUpModal = () => {
        setAuthModalMode("signup");
        setIsAuthModalOpen(true);
    };
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <header className="bg-white text-black p-3 shadow-sm">
                <div className="container mx-auto">
                    <nav className="flex justify-between items-center">
                        {/* Logo */}
                        <div className="w-36">
                            <Link href="/">
                                <Image 
                                    src="/images/logonexwbc-1.png" 
                                    alt="NextWBC Logo" 
                                    width={36} 
                                    height={36} 
                                    className="object-contain"
                                />
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex items-center space-x-8">
                            <Link href="/" className="hover:text-blue-600 transition">Home</Link>
                            <Link href="/prediction" className="hover:text-blue-600 transition">Prediction</Link>
                            <Link href="/tutorial" className="hover:text-blue-600 transition">Tutorial</Link>
                            <Link href="/vault" className="hover:text-blue-600 transition">Vault</Link>
                            {user.role === "ADMIN" && (
                                <Link href="/admin/dashboard" className="hover:text-blue-600 transition">Admin</Link>
                            )}
                        </div>

                        {/* User Profile or Sign In/Up */}
                        {isAuthenticated ? (
                            <div className="w-48 flex items-center justify-end relative" ref={dropdownRef}>
                                <div 
                                    className="flex items-center gap-2 cursor-pointer ml-auto"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <div className="bg-gray-100 p-2 rounded-full">
                                        <UserIcon size={18} />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-medium">{user.username}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                        <p className="text-xs text-blue-600">{user.role}</p>
                                    </div>
                                </div>
                                
                                {isDropdownOpen && (
                                    <UserProfileDropdown 
                                        user={user} 
                                        onSignOut={handleSignOut} 
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                {/* เปลี่ยนจาก Link เป็น Button ที่เปิด Modal */}
                                <button 
                                    onClick={openSignInModal}
                                    className="text-sm text-gray-600 hover:text-blue-600 transition"
                                >
                                    Sign In
                                </button>
                                <button 
                                    onClick={openSignUpModal}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            {/* เพิ่ม AuthModal Component */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authModalMode}
            />
        </>
    );
};

export default Header;
