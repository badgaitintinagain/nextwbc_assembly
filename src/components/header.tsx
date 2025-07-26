"use client"

import AuthModal from "@/components/AuthModal";
import { getUserProfile } from '@/lib/services/userService';
import { Menu, UserIcon, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import UserProfileDropdown from "./userprofile/userprofiledropdown";
import UserProfilePopup from "./userprofile/userprofilepopup";

const Header = () => {
    const { data: session, status } = useSession();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [profile, setProfile] = useState<{ avatar_url?: string, name?: string, email?: string, role?: string } | null>(null);
    
    // Add state for AuthModal
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");
    
    // Add state for mobile profile popup
    const [showMobileProfilePopup, setShowMobileProfilePopup] = useState(false);
    
    // Add debugging
    console.log("Session status:", status);
    console.log("Session data:", session);
    
    useEffect(() => {
        const userId = (session?.user as { id?: string })?.id;
        if (status === 'authenticated' && userId) {
            getUserProfile(userId).then(setProfile);
        }
    }, [status, session]);

    const isAuthenticated = status === "authenticated";
    
    // Use actual user data if authenticated, mock data otherwise
    const user = isAuthenticated ? {
        username: profile?.name || session?.user?.name || "User",
        email: profile?.email || session?.user?.email || "",
        role: profile?.role || session?.user?.role || "USER",
        profileImage: profile?.avatar_url || undefined
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
    
    // Handle mobile profile popup
    const handleMobileEditProfile = () => {
        setShowMobileProfilePopup(true);
        setMobileMenuOpen(false);
    };

    const handleSaveProfile = async (userData: {
        username: string;
        email: string;
        password?: string;
        profileImage?: string;
    }) => {
        try {
            // Here you would make an API call to update the user profile
            console.log('Profile updated:', userData);
            setShowMobileProfilePopup(false);
            
            // Refresh the page to show updated data
            window.location.reload();
        } catch (error) {
            console.error('Error updating profile:', error);
        }
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
            <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md text-white p-2 shadow-lg z-50 border-b border-white/10">
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
                            <Link href="/" className="hover:text-blue-400 transition text-sm text-white">Home</Link>
                            <Link href="/prediction" className="hover:text-blue-400 transition text-sm text-white">Prediction</Link>
                            <Link href="/vault" className="hover:text-blue-400 transition text-sm text-white">Vault</Link>
                            <Link 
                                href="https://huggingface.co/badgaitintin/WBCYOLO_12s_01" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-400 transition text-sm text-white"
                            >
                                Download our Model
                            </Link>
                            {user.role === "ADMIN" && (
                                <Link href="/admin/dashboard" className="hover:text-blue-400 transition text-sm text-white">Admin</Link>
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
                                            {user.profileImage ? (
                                                <img src={user.profileImage} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                                            ) : (
                                                <UserIcon size={16} />
                                            )}
                                        </div>
                                        <div className="text-xs">
                                            <p className="font-medium">{user.username}</p>
                                            <p className="text-xs text-white/70">{user.email}</p>
                                            <p className="text-xs text-blue-400">{user.role}</p>
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
                                <div className="flex items-center">
                                    <button 
                                        onClick={openSignInModal}
                                        className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-xs hover:bg-white/20 transition-all duration-300 shadow-lg"
                                    >
                                        Sign In
                                    </button>
                                </div>
                            )}
                        </div>
                    </nav>
                    
                    {/* Mobile Menu - Slide down panel with blurred background */}
                    {mobileMenuOpen && (
                        <div className="md:hidden mt-1 py-3 border-t border-white/30 animate-fadeIn bg-black/70 backdrop-blur-xl rounded-lg shadow-2xl mx-2" style={{
                            backdropFilter: 'blur(15px)',
                            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        }}>
                            {/* Decorative glass effect elements */}
                            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                                <div className="absolute top-2 left-2 w-6 h-6 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-sm"></div>
                                <div className="absolute bottom-2 right-2 w-4 h-4 bg-gradient-to-tl from-blue-400/50 to-transparent rounded-full blur-sm"></div>
                            </div>
                            
                            <div className="flex flex-col space-y-3 relative z-10">
                                <Link href="/" className="hover:text-blue-400 transition py-2 text-sm text-white drop-shadow-sm hover:backdrop-blur-sm hover:bg-white/10 rounded-lg px-3 hover:scale-105">
                                    Home
                                </Link>
                                <Link href="/prediction" className="hover:text-blue-400 transition py-2 text-sm text-white drop-shadow-sm hover:backdrop-blur-sm hover:bg-white/10 rounded-lg px-3 hover:scale-105">
                                    Prediction
                                </Link>
                                <Link href="/vault" className="hover:text-blue-400 transition py-2 text-sm text-white drop-shadow-sm hover:backdrop-blur-sm hover:bg-white/10 rounded-lg px-3 hover:scale-105">
                                    Vault
                                </Link>
                                <Link 
                                    href="https://huggingface.co/badgaitintin/WBCYOLO_12s_01" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-blue-400 transition py-2 text-sm text-white drop-shadow-sm hover:backdrop-blur-sm hover:bg-white/10 rounded-lg px-3 hover:scale-105"
                                >
                                    Download our Model
                                </Link>
                                {user.role === "ADMIN" && (
                                    <Link href="/admin/dashboard" className="hover:text-blue-400 transition py-2 text-sm text-white drop-shadow-sm hover:backdrop-blur-sm hover:bg-white/10 rounded-lg px-3 hover:scale-105">
                                        Admin
                                    </Link>
                                )}
                                
                                {/* Mobile auth buttons */}
                                <div className="pt-2 border-t border-white/30 mt-2">
                                    {isAuthenticated ? (
                                        <div className="flex flex-col space-y-3">
                                            <div className="flex items-center gap-3 py-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 border border-white/20">
                                                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full border border-white/30">
                                                    {user.profileImage ? (
                                                        <img src={user.profileImage} alt="Profile" className="w-5 h-5 rounded-full object-cover" />
                                                    ) : (
                                                        <UserIcon size={16} className="text-white" />
                                                    )}
                                                </div>
                                                <div className="text-xs">
                                                    <p className="font-medium text-white drop-shadow-sm">{user.username}</p>
                                                    <p className="text-xs text-white/80 drop-shadow-sm">{user.email}</p>
                                                    <p className={`text-xs font-medium drop-shadow-sm inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm mt-1 ${
                                                        user.role === "ADMIN"
                                                            ? 'bg-purple-500/50 text-purple-100 border border-purple-400/50' 
                                                            : 'bg-green-500/50 text-green-100 border border-green-400/50'
                                                    }`}>
                                                        {user.role}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Edit Profile Button */}
                                            <button 
                                                className="flex items-center gap-2 py-2 text-white hover:text-blue-300 transition text-left text-sm hover:backdrop-blur-sm hover:bg-white/10 rounded-lg px-3 hover:scale-105 drop-shadow-sm"
                                                onClick={handleMobileEditProfile}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                                Edit Profile
                                            </button>
                                            
                                            <button 
                                                className="flex items-center gap-2 py-2 text-red-300 hover:text-red-200 transition text-left text-sm hover:backdrop-blur-sm hover:bg-red-500/20 rounded-lg px-3 hover:scale-105 drop-shadow-sm"
                                                onClick={handleSignOut}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Sign Out
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col space-y-2">
                                            <button 
                                                onClick={openSignInModal}
                                                className="bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-600/90 hover:to-purple-600/90 backdrop-blur-sm text-white px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl w-full text-center border border-white/30 hover:scale-105 drop-shadow-sm"
                                            >
                                                Sign In
                                            </button>
                                            <button 
                                                onClick={openSignUpModal}
                                                className="bg-black/40 backdrop-blur-sm border border-white/30 text-white px-4 py-3 rounded-2xl text-sm font-medium hover:bg-black/50 transition-all duration-300 shadow-lg w-full text-center hover:scale-105 drop-shadow-sm"
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
            
            {/* Mobile Profile Popup */}
            {showMobileProfilePopup && (
                <UserProfilePopup 
                    user={user} 
                    onClose={() => setShowMobileProfilePopup(false)}
                    onSave={handleSaveProfile}
                />
            )}
        </>
    );
};

export default Header;
