"use client"

import Footer from "@/components/footer";
import Header from "@/components/header";
import { useState } from "react";

export default function Tutorial() {
    const tutorialSections = [
        {
            id: "auth",
            title: "User Authentication",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
            content: (
                <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                        Welcome to our system&apos;s comprehensive user guide. This guide will help you master all the features of our advanced system to maximize your productivity and achieve optimal results.
                    </p>
                    <div className="backdrop-blur-md bg-white/40 rounded-2xl p-4 border border-white/30 shadow-lg">
                        <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center">
                            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            Getting Started
                        </h3>
                        <p className="text-gray-700 text-sm">
                            To begin using our system, you&apos;ll need valid user credentials. If you don&apos;t have an account yet, please contact your system administrator to obtain your login credentials.
                        </p>
                    </div>
                    <div className="backdrop-blur-md bg-white/40 rounded-2xl p-4 border border-white/30 shadow-lg">
                        <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            Login Process
                        </h3>
                        <div className="flex flex-col items-center">
                            <div className="h-24 w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 text-xs font-medium">Login Screen</p>
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">1</span>
                                    </div>
                                    <span className="text-gray-700 text-xs">Enter your username or email</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">2</span>
                                    </div>
                                    <span className="text-gray-700 text-xs">Enter your secure password</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">3</span>
                                    </div>
                                    <span className="text-gray-700 text-xs">Click login to access the system</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="backdrop-blur-md bg-white/40 rounded-2xl p-4 border border-white/30 shadow-lg">
                        <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center">
                            <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            Security Features
                        </h3>
                        <p className="text-gray-700 text-sm mb-2">
                            Our system employs advanced multi-factor authentication to ensure maximum security for your account. You may be required to verify your identity using:
                        </p>
                        <div className="flex gap-2 justify-center">
                            <div className="backdrop-blur-sm bg-white/50 rounded-xl p-2 border border-white/40 text-center w-20">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-700 text-xs font-medium">Email Codes</p>
                            </div>
                            <div className="backdrop-blur-sm bg-white/50 rounded-xl p-2 border border-white/40 text-center w-20">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-700 text-xs font-medium">SMS Codes</p>
                            </div>
                            <div className="backdrop-blur-sm bg-white/50 rounded-xl p-2 border border-white/40 text-center w-20">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-700 text-xs font-medium">Auth Apps</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "prediction",
            title: "Prediction",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed text-sm">
                        Our advanced prediction system uses cutting-edge machine learning algorithms to provide accurate and reliable predictions for your data analysis needs.
                    </p>
                    <div className="backdrop-blur-md bg-white/40 rounded-2xl p-4 border border-white/30 shadow-lg">
                        <h3 className="text-lg font-semibold mb-2 text-gray-800">
                            Coming Soon
                        </h3>
                        <p className="text-gray-600 text-xs">
                            This section is under development. Stay tuned for detailed instructions on how to use our prediction features.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: "vault",
            title: "Vault",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
            ),
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed text-sm">
                        The vault provides secure storage for your important files and data, with advanced encryption and access controls to keep your information safe.
                    </p>
                    <div className="backdrop-blur-md bg-white/40 rounded-2xl p-4 border border-white/30 shadow-lg">
                        <h3 className="text-lg font-semibold mb-2 text-gray-800">
                            Coming Soon
                        </h3>
                        <p className="text-gray-600 text-xs">
                            This section is under development. Stay tuned for detailed instructions on how to use our vault features.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: "profile",
            title: "User Profile Management",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed text-sm">
                        Manage your user profile, update personal information, and customize your account settings to personalize your experience with our system.
                    </p>
                    <div className="backdrop-blur-md bg-white/40 rounded-2xl p-4 border border-white/30 shadow-lg">
                        <h3 className="text-lg font-semibold mb-2 text-gray-800">
                            Coming Soon
                        </h3>
                        <p className="text-gray-600 text-xs">
                            This section is under development. Stay tuned for detailed instructions on how to manage your user profile.
                        </p>
                    </div>
                </div>
            )
        }
    ];

    const [activeSection, setActiveSection] = useState("auth");

    return (
        <div className="relative flex flex-col min-h-screen w-full bg-black overflow-hidden">
            {/* Background video */}
            <div className="absolute inset-0 z-0 w-full h-full">
                <video
                    autoPlay
                    loop
                    muted
                    className="absolute top-0 left-0 w-full h-full object-cover blur-md brightness-50"
                    style={{ transform: 'scale(1.1)' }} // Slight scale to ensure no gaps
                >
                    <source src="/shortvid/gradient_loop.mp4" type="video/mp4" />
                </video>
            </div>
            {/* Semi-transparent overlay */}
            <div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-md w-full h-full"></div>
            {/* Main content */}
            <main className="relative z-20 flex flex-col flex-1">
                <Header />
                <div className="flex flex-1 items-center justify-center w-full max-w-7xl mx-auto px-2 py-6 gap-6" style={{minHeight: '70vh'}}>
                    {/* Sidebar */}
                    <aside className="hidden md:flex flex-col w-56 rounded-2xl backdrop-blur-xl bg-white/40 border border-white/30 shadow-2xl p-4 h-[420px] max-h-[80vh] justify-start select-none" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="inline-block w-3 h-3 bg-red-400 rounded-full"></span>
                            <span className="inline-block w-3 h-3 bg-yellow-300 rounded-full"></span>
                            <span className="inline-block w-3 h-3 bg-green-400 rounded-full"></span>
                        </div>
                        <nav className="flex flex-col gap-2">
                            {tutorialSections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-left font-medium text-base hover:bg-white/70 hover:text-gray-900 focus:outline-none ${activeSection === section.id ? 'bg-white/80 text-gray-900 shadow' : 'text-gray-700'}`}
                                    style={activeSection === section.id ? {boxShadow: '0 2px 8px 0 rgba(31,38,135,0.10)'} : {}}
                                >
                                    <span>{section.icon}</span>
                                    <span>{section.title}</span>
                                </button>
                            ))}
                        </nav>
                    </aside>
                    {/* Main content area */}
                    <section className="flex-1 min-w-0 max-w-2xl w-full h-[420px] max-h-[80vh] overflow-auto rounded-2xl backdrop-blur-xl bg-white/40 border border-white/30 shadow-2xl p-6 flex flex-col" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                            {tutorialSections.find(s => s.id === activeSection)?.title}
                        </h1>
                        <div className="flex-1 overflow-y-auto pr-1">
                            {tutorialSections.find(s => s.id === activeSection)?.content}
                        </div>
                    </section>
                </div>
                <Footer />
            </main>
        </div>
    );
}