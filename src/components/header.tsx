"use client"

import AuthModal from "@/components/AuthModal";
import { Menu, UserIcon, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import UserProfileDropdown from "./userprofile/userprofiledropdown";

const Header = () => {
    const { data: session, status } = useSession();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Add state for AuthModal
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
    
    // Open Modal functions
    const openSignInModal = () => {
        setAuthModalMode("signin");
        setIsAuthModalOpen(true);
        setMobileMenuOpen(false);
    };

    const openSignUpModal = () => {
        setAuthModalMode("signup");
        setIsAuthModalOpen(true);
        setMobileMenuOpen(false);
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

    // Prevent body scrolling when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    return (
        <>
            <header className="bg-white text-black p-2 shadow-sm z-30 relative">
                <div className="container mx-auto">
                    <nav className="flex justify-between items-center">
                        {/* Logo */}
                        <div className="w-28">
                            <Link href="/">
                                <Image 
                                    src="/images/logonexwbc-1.png" 
                                    alt="NextWBC Logo" 
                                    width={28} 
                                    height={28} 
                                    className="object-contain"
                                />
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button 
                            className="md:hidden flex items-center z-50"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center space-x-6">
                            <Link href="/" className="hover:text-blue-600 transition text-sm">Home</Link>
                            <Link href="/prediction" className="hover:text-blue-600 transition text-sm">Prediction</Link>
                            <Link href="/tutorial" className="hover:text-blue-600 transition text-sm">Tutorial</Link>
                            <Link href="/vault" className="hover:text-blue-600 transition text-sm">Vault</Link>
                            {user.role === "ADMIN" && (
                                <Link href="/admin/dashboard" className="hover:text-blue-600 transition text-sm">Admin</Link>
                            )}
                        </div>

                        {/* Desktop User Profile or Sign In/Up */}
                        <div className="hidden md:block">
                            {isAuthenticated ? (
                                <div className="w-40 flex items-center justify-end relative" ref={dropdownRef}>
                                    <div 
                                        className="flex items-center gap-2 cursor-pointer ml-auto"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    >
                                        <div className="bg-gray-100 p-1.5 rounded-full">
                                            <UserIcon size={16} />
                                        </div>
                                        <div className="text-xs">
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
                                <div className="flex items-center space-x-3">
                                    <button 
                                        onClick={openSignInModal}
                                        className="text-xs text-gray-600 hover:text-blue-600 transition"
                                    >
                                        Sign In
                                    </button>
                                    <button 
                                        onClick={openSignUpModal}
                                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs hover:bg-blue-700 transition"
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            )}
                        </div>
                    </nav>
                    
                    {/* Mobile Menu - Slide down panel with blurred background */}
                    {mobileMenuOpen && (
                        <div className="md:hidden mt-1 py-2 border-t border-gray-100 animate-fadeIn bg-white/40 backdrop-blur-sm">
                            <div className="flex flex-col space-y-2">
                                <Link href="/" className="hover:text-blue-600 transition py-1 text-sm">
                                    Home
                                </Link>
                                <Link href="/prediction" className="hover:text-blue-600 transition py-1 text-sm">
                                    Prediction
                                </Link>
                                <Link href="/tutorial" className="hover:text-blue-600 transition py-1 text-sm">
                                    Tutorial
                                </Link>
                                <Link href="/vault" className="hover:text-blue-600 transition py-1 text-sm">
                                    Vault
                                </Link>
                                {user.role === "ADMIN" && (
                                    <Link href="/admin/dashboard" className="hover:text-blue-600 transition py-1 text-sm">
                                        Admin
                                    </Link>
                                )}
                                
                                {/* Mobile auth buttons */}
                                <div className="pt-1 border-t border-gray-100 mt-1">
                                    {isAuthenticated ? (
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center gap-2 py-1">
                                                <div className="bg-gray-100 p-1.5 rounded-full">
                                                    <UserIcon size={16} />
                                                </div>
                                                <div className="text-xs">
                                                    <p className="font-medium">{user.username}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <button 
                                                className="py-1 text-red-600 hover:text-red-800 transition text-left text-xs"
                                                onClick={handleSignOut}
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col space-y-1">
                                            <button 
                                                onClick={openSignInModal}
                                                className="text-gray-800 hover:text-blue-600 transition py-1 text-left text-xs"
                                            >
                                                Sign In
                                            </button>
                                            <button 
                                                onClick={openSignUpModal}
                                                className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs hover:bg-blue-700 transition w-full text-center"
                                            >
                                                Sign Up
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* AuthModal Component */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authModalMode}
            />
        </>
    );
};

export default Header;
