"use client"

import Footer from "@/components/footer";
import Header from "@/components/header";
import { useState } from "react";

export default function Tutorial() {
    const [language, setLanguage] = useState("en"); // "en" for English, "th" for Thai
    const [activeSection, setActiveSection] = useState("auth");
    
    const toggleLanguage = () => {
        setLanguage(language === "en" ? "th" : "en");
    };

    const tutorialSections = [
        {
            id: "auth",
            title: language === "en" ? "User Authentication" : "การยืนยันตัวตน",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            )
        },
        {
            id: "prediction",
            title: language === "en" ? "Prediction" : "การทำนาย",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            id: "vault",
            title: language === "en" ? "Vault" : "ห้องนิรภัย",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
            )
        },
        {
            id: "profile",
            title: language === "en" ? "User Profile Management" : "การจัดการโปรไฟล์ผู้ใช้",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        }
    ];
    
    return (
        <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Header Section */}
                <div className="backdrop-blur-xl bg-white/30 rounded-3xl p-6 mb-8 border border-white/20 shadow-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                {language === "en" ? "User Guide" : "คู่มือการใช้งาน"}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {language === "en" ? "Learn how to use our system effectively" : "เรียนรู้วิธีการใช้งานระบบของเราอย่างมีประสิทธิภาพ"}
                            </p>
                        </div>
                        <button 
                            onClick={toggleLanguage}
                            className="backdrop-blur-md bg-white/40 hover:bg-white/60 px-6 py-3 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3 group"
                        >
                            <span className="font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                                {language === "en" ? "TH" : "EN"}
                            </span>
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578l-.846 2.262a1 1 0 11-1.864-.736l.793-2.126H5a1 1 0 110-2h3V3a1 1 0 011-1z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M4.293 9.293a1 1 0 011.414 0L10 13.586l4.293-4.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Navigation - Glassmorphism Style */}
                    <div className="lg:col-span-3">
                        <div className="backdrop-blur-xl bg-white/30 rounded-3xl p-6 border border-white/20 shadow-2xl sticky top-8">
                            <h2 className="text-xl font-semibold mb-6 text-gray-800">
                                {language === "en" ? "Tutorial Topics" : "หัวข้อบทเรียน"}
                            </h2>
                            <div className="space-y-3">
                                {tutorialSections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full p-4 rounded-2xl transition-all duration-300 flex items-center space-x-3 group ${
                                            activeSection === section.id
                                                ? 'backdrop-blur-md bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white shadow-lg'
                                                : 'backdrop-blur-md bg-white/40 hover:bg-white/60 text-gray-700 hover:text-gray-900 border border-white/30 hover:border-white/50 shadow-md hover:shadow-lg'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-xl ${
                                            activeSection === section.id 
                                                ? 'bg-white/20' 
                                                : 'bg-gradient-to-br from-blue-400/20 to-purple-400/20'
                                        }`}>
                                            {section.icon}
                                        </div>
                                        <span className="font-medium">{section.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Main Content - Glassmorphism Style */}
                    <div className="lg:col-span-9">
                        <div className="backdrop-blur-xl bg-white/30 rounded-3xl p-8 border border-white/20 shadow-2xl">
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                                    {tutorialSections.find(s => s.id === activeSection)?.title}
                                </h2>
                                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                            </div>
                            
                            <div className="prose max-w-none">
                                {activeSection === "auth" && (
                                    <div className="space-y-6">
                                        <p className="text-gray-700 leading-relaxed">
                                            {language === "en" ? "Welcome to our system's comprehensive user guide. This guide will help you master all the features of our advanced system to maximize your productivity and achieve optimal results." : "ยินดีต้อนรับสู่คู่มือการใช้งานระบบที่ครอบคลุมของเรา คู่มือนี้จะช่วยให้คุณเชี่ยวชาญคุณสมบัติทั้งหมดของระบบขั้นสูงของเราเพื่อเพิ่มประสิทธิภาพการทำงานและบรรลุผลลัพธ์ที่ดีที่สุด"}
                                        </p>
                                        
                                        <div className="backdrop-blur-md bg-white/40 rounded-2xl p-6 border border-white/30 shadow-lg">
                                            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                                                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                {language === "en" ? "Getting Started" : "เริ่มต้นใช้งาน"}
                                            </h3>
                                            <p className="text-gray-700 mb-4">
                                                {language === "en" ? "To begin using our system, you'll need valid user credentials. If you don't have an account yet, please contact your system administrator to obtain your login credentials." : "ในการเริ่มต้นใช้งานระบบของเรา คุณจะต้องมีข้อมูลประจำตัวผู้ใช้ที่ถูกต้อง หากคุณยังไม่มีบัญชี โปรดติดต่อผู้ดูแลระบบของคุณเพื่อรับข้อมูลการเข้าสู่ระบบ"}
                                            </p>
                                        </div>
                                        
                                        <div className="backdrop-blur-md bg-white/40 rounded-2xl p-6 border border-white/30 shadow-lg">
                                            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                                {language === "en" ? "Login Process" : "กระบวนการเข้าสู่ระบบ"}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="backdrop-blur-sm bg-white/50 rounded-xl p-4 border border-white/40">
                                                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-3">
                                                        <div className="text-center">
                                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                            </div>
                                                            <p className="text-gray-600 font-medium">{language === "en" ? "Login Screen" : "หน้าจอเข้าสู่ระบบ"}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 text-center">{language === "en" ? "Secure authentication interface" : "อินเทอร์เฟซการยืนยันตัวตนที่ปลอดภัย"}</p>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                                            <span className="text-white text-xs font-bold">1</span>
                                                        </div>
                                                        <span className="text-gray-700">{language === "en" ? "Enter your username or email" : "ป้อนชื่อผู้ใช้หรืออีเมลของคุณ"}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                                            <span className="text-white text-xs font-bold">2</span>
                                                        </div>
                                                        <span className="text-gray-700">{language === "en" ? "Enter your secure password" : "ป้อนรหัสผ่านที่ปลอดภัยของคุณ"}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                                            <span className="text-white text-xs font-bold">3</span>
                                                        </div>
                                                        <span className="text-gray-700">{language === "en" ? "Click login to access the system" : "คลิกเข้าสู่ระบบเพื่อเข้าถึงระบบ"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="backdrop-blur-md bg-white/40 rounded-2xl p-6 border border-white/30 shadow-lg">
                                            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                                                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                </div>
                                                {language === "en" ? "Security Features" : "คุณสมบัติด้านความปลอดภัย"}
                                            </h3>
                                            <p className="text-gray-700 mb-4">
                                                {language === "en" ? "Our system employs advanced multi-factor authentication to ensure maximum security for your account. You may be required to verify your identity using:" : "ระบบของเราใช้การยืนยันตัวตนหลายปัจจัยขั้นสูงเพื่อรับประกันความปลอดภัยสูงสุดสำหรับบัญชีของคุณ คุณอาจต้องยืนยันตัวตนของคุณโดยใช้:"}
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="backdrop-blur-sm bg-white/50 rounded-xl p-4 border border-white/40 text-center">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-gray-700 font-medium">{language === "en" ? "Email Codes" : "รหัสอีเมล"}</p>
                                                </div>
                                                <div className="backdrop-blur-sm bg-white/50 rounded-xl p-4 border border-white/40 text-center">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-gray-700 font-medium">{language === "en" ? "SMS Codes" : "รหัส SMS"}</p>
                                                </div>
                                                <div className="backdrop-blur-sm bg-white/50 rounded-xl p-4 border border-white/40 text-center">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-gray-700 font-medium">{language === "en" ? "Auth Apps" : "แอปยืนยันตัวตน"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {activeSection === "prediction" && (
                                    <div className="space-y-6">
                                        <p className="text-gray-700 leading-relaxed">
                                            {language === "en" ? "Our advanced prediction system uses cutting-edge machine learning algorithms to provide accurate and reliable predictions for your data analysis needs." : "ระบบการทำนายขั้นสูงของเราใช้อัลกอริทึมการเรียนรู้ของเครื่องที่ล้ำสมัยเพื่อให้การทำนายที่แม่นยำและเชื่อถือได้สำหรับความต้องการการวิเคราะห์ข้อมูลของคุณ"}
                                        </p>
                                        <div className="backdrop-blur-md bg-white/40 rounded-2xl p-6 border border-white/30 shadow-lg">
                                            <h3 className="text-xl font-semibold mb-4 text-gray-800">
                                                {language === "en" ? "Coming Soon" : "เร็วๆ นี้"}
                                            </h3>
                                            <p className="text-gray-600">
                                                {language === "en" ? "This section is under development. Stay tuned for detailed instructions on how to use our prediction features." : "ส่วนนี้อยู่ระหว่างการพัฒนา ติดตามคำแนะนำโดยละเอียดเกี่ยวกับวิธีการใช้คุณสมบัติการทำนายของเรา"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                {activeSection === "vault" && (
                                    <div className="space-y-6">
                                        <p className="text-gray-700 leading-relaxed">
                                            {language === "en" ? "The vault provides secure storage for your important files and data, with advanced encryption and access controls to keep your information safe." : "ห้องนิรภัยให้การจัดเก็บที่ปลอดภัยสำหรับไฟล์และข้อมูลสำคัญของคุณ พร้อมการเข้ารหัสขั้นสูงและการควบคุมการเข้าถึงเพื่อรักษาความปลอดภัยของข้อมูลของคุณ"}
                                        </p>
                                        <div className="backdrop-blur-md bg-white/40 rounded-2xl p-6 border border-white/30 shadow-lg">
                                            <h3 className="text-xl font-semibold mb-4 text-gray-800">
                                                {language === "en" ? "Coming Soon" : "เร็วๆ นี้"}
                                            </h3>
                                            <p className="text-gray-600">
                                                {language === "en" ? "This section is under development. Stay tuned for detailed instructions on how to use our vault features." : "ส่วนนี้อยู่ระหว่างการพัฒนา ติดตามคำแนะนำโดยละเอียดเกี่ยวกับวิธีการใช้คุณสมบัติห้องนิรภัยของเรา"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                {activeSection === "profile" && (
                                    <div className="space-y-6">
                                        <p className="text-gray-700 leading-relaxed">
                                            {language === "en" ? "Manage your user profile, update personal information, and customize your account settings to personalize your experience with our system." : "จัดการโปรไฟล์ผู้ใช้ของคุณ อัปเดตข้อมูลส่วนบุคคล และปรับแต่งการตั้งค่าบัญชีของคุณเพื่อปรับแต่งประสบการณ์ของคุณกับระบบของเรา"}
                                        </p>
                                        <div className="backdrop-blur-md bg-white/40 rounded-2xl p-6 border border-white/30 shadow-lg">
                                            <h3 className="text-xl font-semibold mb-4 text-gray-800">
                                                {language === "en" ? "Coming Soon" : "เร็วๆ นี้"}
                                            </h3>
                                            <p className="text-gray-600">
                                                {language === "en" ? "This section is under development. Stay tuned for detailed instructions on how to manage your user profile." : "ส่วนนี้อยู่ระหว่างการพัฒนา ติดตามคำแนะนำโดยละเอียดเกี่ยวกับวิธีการจัดการโปรไฟล์ผู้ใช้ของคุณ"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Tutorial Navigation */}
                            <div className="mt-8 flex justify-between">
                                <button className="backdrop-blur-md bg-white/40 hover:bg-white/60 px-6 py-3 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center group">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                                        {language === "en" ? "Previous" : "ก่อนหน้า"}
                                    </span>
                                </button>
                                <button className="backdrop-blur-md bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-600/80 hover:to-purple-600/80 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center group">
                                    <span className="font-medium">
                                        {language === "en" ? "Next: Prediction" : "ถัดไป: การทำนาย"}
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
        </>
    );
}