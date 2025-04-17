import React from "react";

const Footer = () => {
    return (
        <footer className="bg-white text-black p-4 mt-8">
            <div className="flex justify-center items-center">
                <nav className="text-center">
                    <p className="text-sm">Hello, welcome to NextWBC!</p>
                    {/* You can add links here */}
                    <p className="text-xs text-gray-500 mt-2">
                        &copy; 2025 NextWBC. All rights reserved.
                    </p>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
