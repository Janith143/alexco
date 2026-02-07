"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, Search, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CartSheet from "./CartSheet";
import TopBar from "./TopBar";
import MegaMenu from "./MegaMenu";
import SearchBar from "./SearchBar";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
            {/* 1. Top Utility Bar */}
            <TopBar />

            {/* 2. Main Header (Sticky) */}
            <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-8">

                    {/* Mobile Menu & Logo */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-6 w-6" />
                        </Button>
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/logo.svg" alt="Alexco Electronics" width={40} height={40} className="h-10 w-auto object-contain" />
                            <span className="font-bold text-2xl tracking-tight text-slate-900 hidden sm:block">
                                Alexco <span className="text-blue-600">Electronics</span>
                            </span>
                        </Link>
                    </div>

                    {/* Search Bar (Centered & Wide) */}
                    <div className="hidden md:flex flex-1 max-w-2xl relative px-8">
                        <SearchBar className="w-full" />
                    </div>

                    {/* Actions (Right) */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/*
                        <Button variant="ghost" size="icon" className="hidden md:flex flex-col gap-0.5 h-auto py-1 px-2 hover:bg-transparent hover:text-blue-600">
                            <User className="h-5 w-5" />
                            <span className="text-[10px] font-medium">Account</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="hidden md:flex flex-col gap-0.5 h-auto py-1 px-2 hover:bg-transparent hover:text-blue-600">
                            <Heart className="h-5 w-5" />
                            <span className="text-[10px] font-medium">Wishlist</span>
                        </Button>
*/}
                        <div className="flex flex-col items-center justify-center px-2">
                            <CartSheet />
                            <span className="text-[10px] font-medium hidden md:block">Cart</span>
                        </div>
                    </div>
                </div>

                {/* 3. Mega Menu (Desktop Only) */}
                <MegaMenu />
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300">
                {/* Newsletter Section */}
                <div className="border-b border-slate-800">
                    <div className="container mx-auto px-4 py-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-bold text-white mb-1">Stay Updated</h3>
                                <p className="text-slate-400 text-sm">Subscribe for exclusive deals and latest product updates.</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto max-w-md">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 flex-1"
                                />
                                <Button className="bg-blue-600 hover:bg-blue-700 px-6">Subscribe</Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Image src="/logo.svg" alt="Alexco Electronics" width={40} height={40} className="h-10 w-auto object-contain" />
                            <span className="font-bold text-2xl text-white">Alexco <span className="text-blue-500">Electronics</span></span>
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Your trusted partner for solar energy solutions and electrical components in Sri Lanka.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-3 mt-4">
                            {['📘', '📸', '🐦', '📺'].map((icon, i) => (
                                <button key={i} className="h-9 w-9 rounded-full bg-slate-800 hover:bg-blue-600 transition-colors flex items-center justify-center text-sm">
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Shop</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
                            <li><Link href="/shop?category=Solar" className="hover:text-white transition-colors">Solar Systems</Link></li>
                            <li><Link href="/shop?category=Electrical" className="hover:text-white transition-colors">Electrical</Link></li>
                            <li><Link href="/shop?sortBy=newest" className="hover:text-white transition-colors">New Arrivals</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Support</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
                            <li><Link href="/policies/warranty" className="hover:text-white transition-colors">Warranty Policy</Link></li>
                            <li><Link href="/policies/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Company</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/policies/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/policies/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/paths/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">Contact</h4>
                        <div className="text-sm text-slate-400 space-y-3">
                            <p className="flex items-start gap-2">
                                <span>📍</span>
                                <span>123 Main Street, Colombo 03, Sri Lanka</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <span>📞</span>
                                <span>+94 11 234 5678</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <span>✉️</span>
                                <span>sales@alexco.lk</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800">
                    <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-slate-500">© 2026 Alexco Technologies. All rights reserved.</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">🔒 Secure Payments</span>
                            <span className="flex items-center gap-1">🚚 Islandwide Delivery</span>
                            <span className="flex items-center gap-1">✅ Quality Guaranteed</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
