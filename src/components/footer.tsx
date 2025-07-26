const Footer = () => {
    return (
        <footer className="bg-transparent text-white p-1 mt-2 backdrop-blur-sm border-t border-white/10">
            <div className="flex flex-col justify-center items-center">
                <nav className="text-center text-xs">
                    <div className="flex flex-col md:flex-row items-center justify-center mb-0.5">
                        <p className="text-xs">School of Engineering and Technology</p>
                        <span className="hidden md:inline mx-1">|</span>
                        <p className="text-xs">Akkhraratchakumari Veterinary College</p>
                    </div>
                    <p className="text-xs text-center">Computer Engineering and Artificial Intelligence</p>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
