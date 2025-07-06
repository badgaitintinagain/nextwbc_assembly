const Footer = () => {
    return (
        <footer className="bg-white text-black p-2 mt-4">
            <div className="flex flex-col justify-center items-center">
                <nav className="text-center text-sm">
                    <div className="flex flex-col md:flex-row items-center justify-center mb-1">
                        <p className="text-xs md:text-sm">School of Engineering and Technology</p>
                        <span className="hidden md:inline mx-2">|</span>
                        <p className="text-xs md:text-sm">Akkhraratchakumari Veterinary College</p>
                    </div>
                    <p className="text-xs text-center">Computer Engineering and Artificial Intelligence</p>
                    <p className="text-xs text-gray-500 mt-2">
                        &copy; 2025 NextWBC. All rights reserved.
                    </p>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
