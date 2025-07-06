"use client"

import Footer from "@/components/footer";
import Header from "@/components/header";
import { useState } from "react";

export default function Tutorial() {
    const [language, setLanguage] = useState("en"); // "en" for English, "th" for Thai
    
    const toggleLanguage = () => {
        setLanguage(language === "en" ? "th" : "en");
    };
    
    return (
        <>
        <Header />
        <div className="container mx-auto px-4 py-8 text-black">
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-3">
                <h1 className="text-4xl font-bold text-black">
                    {language === "en" ? "User Guide" : "คู่มือการใช้งาน"}
                </h1>
                <button 
                    onClick={toggleLanguage}
                    className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:shadow transition duration-200"
                >
                    <span className="font-medium">{language === "en" ? "TH" : "EN"}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578l-.846 2.262a1 1 0 11-1.864-.736l.793-2.126H5a1 1 0 110-2h3V3a1 1 0 011-1z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M4.293 9.293a1 1 0 011.414 0L10 13.586l4.293-4.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Sidebar Navigation - Modern Card Style */}
                <div className="md:col-span-3 bg-white rounded-xl p-5 shadow-lg">
                    <h2 className="text-xl font-semibold mb-5 text-black">
                        {language === "en" ? "Tutorial Topics" : "หัวข้อบทเรียน"}
                    </h2>
                    <ul className="space-y-3">
                        <li className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-lg shadow-md">
                            <a href="#" className="block flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                {language === "en" ? "User Authentication" : "การยืนยันตัวตน"}
                            </a>
                        </li>
                        <li className="bg-white hover:bg-gray-50 p-3 rounded-lg border border-gray-200 transition duration-200 shadow-sm hover:shadow">
                            <a href="#" className="block flex items-center text-black">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                {language === "en" ? "Prediction" : "การทำนาย"}
                            </a>
                        </li>
                        <li className="bg-white hover:bg-gray-50 p-3 rounded-lg border border-gray-200 transition duration-200 shadow-sm hover:shadow">
                            <a href="#" className="block flex items-center text-black">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                {language === "en" ? "Vault" : "ห้องนิรภัย"}
                            </a>
                        </li>
                        <li className="bg-white hover:bg-gray-50 p-3 rounded-lg border border-gray-200 transition duration-200 shadow-sm hover:shadow">
                            <a href="#" className="block flex items-center text-black">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {language === "en" ? "User Profile Management" : "การจัดการโปรไฟล์ผู้ใช้"}
                            </a>
                        </li>
                    </ul>
                </div>
                
                {/* Main Content - Modern Design */}
                <div className="md:col-span-9 bg-white rounded-xl p-8 shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">{language === "en" ? "User Authentication" : "การยืนยันตัวตน"}</h2>
                    
                    <div className="prose max-w-none">
                        <p className="mb-4">
                            {language === "en" ? "Welcome to our system's user guide. This guide will help you learn how to use all the features of our system effectively to maximize your productivity." : "ยินดีต้อนรับสู่คู่มือการใช้งานระบบของเรา คู่มือนี้จะช่วยให้คุณเรียนรู้วิธีการใช้คุณสมบัติทั้งหมดของระบบของเราอย่างมีประสิทธิภาพเพื่อเพิ่มประสิทธิภาพการทำงานของคุณ"}
                        </p>
                        
                        <h3 className="text-xl font-semibold my-3">{language === "en" ? "Logging In" : "การเข้าสู่ระบบ"}</h3>
                        <p className="mb-4">
                            {language === "en" ? "To start using the system, you'll need a user account and password. If you don't have an account yet, please contact your system administrator to get your login credentials." : "ในการเริ่มต้นใช้งานระบบ คุณจะต้องมีบัญชีผู้ใช้และรหัสผ่าน หากคุณยังไม่มีบัญชี โปรดติดต่อผู้ดูแลระบบของคุณเพื่อรับข้อมูลการเข้าสู่ระบบ"}
                        </p>
                        
                        <div className="bg-gray-100 p-4 rounded-lg mb-4">
                            <div className="flex justify-center">
                                <div className="border border-gray-300 rounded shadow-sm bg-white p-2 w-full max-w-md">
                                    <div className="h-40 bg-gray-200 flex items-center justify-center mb-2">
                                        <p className="text-gray-500">{language === "en" ? "Login Screen Example" : "ตัวอย่างหน้าจอเข้าสู่ระบบ"}</p>
                                    </div>
                                    <p className="text-sm text-gray-600 text-center">{language === "en" ? "Figure 1: Login Screen" : "รูปที่ 1: หน้าจอเข้าสู่ระบบ"}</p>
                                </div>
                            </div>
                        </div>
                        
                        <h3 className="text-xl font-semibold my-3">{language === "en" ? "System Navigation" : "การนำทางระบบ"}</h3>
                        <p>
                            {language === "en" ? "After logging in, you'll see the main dashboard which consists of the following sections:" : "หลังจากเข้าสู่ระบบแล้ว คุณจะเห็นแดชบอร์ดหลักซึ่งประกอบด้วยส่วนต่อไปนี้:"}
                        </p>
                        <ul className="list-disc pl-6 my-3 space-y-2">
                            <li><span className="font-medium">{language === "en" ? "Top Navigation Bar:" : "แถบนำทางด้านบน:"}</span> {language === "en" ? "Access main system functions" : "เข้าถึงฟังก์ชันหลักของระบบ"}</li>
                            <li><span className="font-medium">{language === "en" ? "Side Menu:" : "เมนูด้านข้าง:"}</span> {language === "en" ? "List of specific features available" : "รายการคุณสมบัติเฉพาะที่มีอยู่"}</li>
                            <li><span className="font-medium">{language === "en" ? "Main Area:" : "พื้นที่หลัก:"}</span> {language === "en" ? "Displays the primary content and functions" : "แสดงเนื้อหาและฟังก์ชันหลัก"}</li>
                        </ul>
                        
                        <h3 className="text-xl font-semibold my-3">{language === "en" ? "Security Features" : "คุณสมบัติด้านความปลอดภัย"}</h3>
                        <p className="mb-4">
                            {language === "en" ? "Our system employs multi-factor authentication to protect your account. You may be asked to verify your identity using:" : "ระบบของเราใช้การยืนยันตัวตนหลายปัจจัยเพื่อปกป้องบัญชีของคุณ คุณอาจถูกขอให้ยืนยันตัวตนของคุณโดยใช้:"}
                        </p>
                        <ul className="list-disc pl-6 my-3 space-y-2">
                            <li>{language === "en" ? "Email verification codes" : "รหัสยืนยันทางอีเมล"}</li>
                            <li>{language === "en" ? "SMS codes" : "รหัส SMS"}</li>
                            <li>{language === "en" ? "Authentication app" : "แอปยืนยันตัวตน"}</li>
                        </ul>
                    </div>
                    
                    {/* Tutorial Navigation */}
                    <div className="mt-8 flex justify-between">
                        <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition duration-200 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            {language === "en" ? "Previous" : "ก่อนหน้า"}
                        </button>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center">
                            {language === "en" ? "Next: Prediction" : "ถัดไป: การทำนาย"}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
        </>
    );
}