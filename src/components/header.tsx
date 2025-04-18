import Image from "next/image";
import Link from "next/link";

const Header = () => {
    return (
        <header className="bg-white text-black p-3 shadow-sm">
            <div className="container mx-auto">
                <nav className="flex justify-center items-center">
                    {/* ทุกอย่างอยู่ตรงกลาง */}
                    <div className="flex items-center space-x-8">
                        <Link href="/">
                            <Image 
                                src="/images/logonexwbc-1.png" 
                                alt="NextWBC Logo" 
                                width={36} 
                                height={36} 
                                className="object-contain"
                            />
                        </Link>
                        <Link href="/" className="hover:text-blue-600 transition">Home</Link>
                        <Link href="/prediction" className="hover:text-blue-600 transition">Prediction</Link>
                        <Link href="/tutorial" className="hover:text-blue-600 transition">Tutorial</Link>
                        <Link href="/analysis" className="hover:text-blue-600 transition">Analysis</Link>
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Header;
