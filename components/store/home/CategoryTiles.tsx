"use client";

import Link from "next/link";
import { ArrowRight, Smartphone, Laptop, Tv, Camera, Watch, Gamepad2, Headphones, Speaker } from "lucide-react";

const categories = [
    {
        name: "Smartphones",
        icon: Smartphone,
        count: "120+ Items",
        href: "/category/mobile",
        color: "bg-blue-100 text-blue-600"
    },
    {
        name: "Laptops",
        icon: Laptop,
        count: "85+ Items",
        href: "/category/computers",
        color: "bg-purple-100 text-purple-600"
    },
    {
        name: "Smart Watches",
        icon: Watch,
        count: "45+ Items",
        href: "/category/wearables",
        color: "bg-green-100 text-green-600"
    },
    {
        name: "Audio",
        icon: Headphones,
        count: "90+ Items",
        href: "/category/audio",
        color: "bg-orange-100 text-orange-600"
    },
    {
        name: "Gaming",
        icon: Gamepad2,
        count: "60+ Items",
        href: "/category/gaming",
        color: "bg-red-100 text-red-600"
    },
    {
        name: "Cameras",
        icon: Camera,
        count: "30+ Items",
        href: "/category/cameras",
        color: "bg-indigo-100 text-indigo-600"
    }
];

export default function CategoryTiles() {
    return (
        <section className="py-12 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Shop by Category</h2>
                    <Link href="/shop" className="text-blue-600 font-medium flex items-center hover:underline">
                        View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories.map((cat) => (
                        <Link
                            key={cat.name}
                            href={cat.href}
                            className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group flex flex-col items-center text-center"
                        >
                            <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 ${cat.color} group-hover:scale-110 transition-transform`}>
                                <cat.icon className="h-8 w-8" />
                            </div>
                            <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                            <span className="text-xs text-slate-500 mt-1">{cat.count}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
