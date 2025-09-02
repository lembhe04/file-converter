"use client";

import Link from "next/link";

export default function Navbar() {
    return (
        <nav className=" bg-white ">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
                    Converter
                </Link>

                {/* Links */}
                {/* Links */}
                <div className="hidden md:flex gap-8 text-gray-700 font-medium">
                    <Link href="/" className="hover:underline underline-offset-4">Home</Link>
                    <Link href="/apis" className="hover:underline underline-offset-4">APIs</Link>
                    <Link href="/pricing" className="hover:underline underline-offset-4">Pricing</Link>
                    <Link href="/about" className="hover:underline underline-offset-4">About</Link>
                </div>


                {/* Button */}
                <Link
                    href="/premium"
                    className="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition"
                >
                    Go Premium
                </Link>
            </div>
        </nav>
    );
}
