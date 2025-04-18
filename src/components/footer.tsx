const Footer = () => {
    return (
        <footer className="bg-white text-black p-2 mt-4">
            <div className="flex flex-col justify-center items-center">
                <nav className="text-center text-sm">
                    <div className="flex items-center justify-center mb-1">
                        <p>School of Engineering and Technology</p>
                        <span className="mx-2">|</span>
                        <p>Akkhraratchakumari Veterinary College</p>
                    </div>
                    <p className="text-xs">Computer Engineering and Artificial Intelligence</p>
                    <p className="text-xs text-gray-500 mt-2">
                        &copy; 2025 NextWBC. All rights reserved.
                    </p>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
