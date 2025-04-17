import React from "react";
import Link from "next/link";

const Header = () => {
    return (
        <header className="bg-white text-black p-3">
            <nav className="flex justify-center space-x-8 font-sans">
                <Link href="/">Home</Link>
                <Link href="nextwbc_assembly\src\app\prediction\page.tsx">Prediction</Link>
                <Link href="/tutorial">Tutorial</Link>
                <Link href="/analysis">Analysis</Link>
            </nav>
        </header>
    )
}

export default Header;
