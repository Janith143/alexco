"use client";

import { Phone, MapPin, Globe } from "lucide-react";

export default function TopBar() {
    return (
        <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 border-b border-slate-800 hidden md:block">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <span>Free Delivery on orders over LKR 50,000</span>
                    <span className="hidden lg:inline">Official Warranty on all products</span>
                </div>
                <div className="flex items-center gap-6">
                    <a href="tel:+94112345678" className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <Phone className="h-3 w-3" />
                        <span>Hotline: 011 234 5678</span>
                    </a>
                    <a href="/stores" className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <MapPin className="h-3 w-3" />
                        <span>Store Locator</span>
                    </a>
                    <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                        <Globe className="h-3 w-3" />
                        <span>EN / LKR</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
