"use client";

import Link from "next/link";
import { ChevronDown, Smartphone, Laptop, Tv, Speaker, Home, Watch, Gamepad2, Wifi, Cpu } from "lucide-react";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const categories = [
    {
        title: "Solar & Power",
        icon: Smartphone, // Using generic icons for now, mapped to request
        href: "/category/solar",
        subcategories: [
            { name: "Solar Panels", href: "/category/solar?type=panel" },
            { name: "Inverters", href: "/category/solar?type=inverter" },
            { name: "Batteries", href: "/category/solar?type=battery" },
            { name: "Accessories", href: "/category/solar?type=access" },
        ]
    },
    {
        title: "Electrical",
        icon: Laptop,
        href: "/category/electrical",
        subcategories: [
            { name: "Wiring & Cables", href: "/category/electrical?type=cable" },
            { name: "Switches & Sockets", href: "/category/electrical?type=switch" },
            { name: "Protection Devices", href: "/category/electrical?type=protection" },
            { name: "Lighting", href: "/category/electrical?type=light" },
        ]
    },
    // Adding placeholder electronics categories as requested
    {
        title: "Mobile & Gadgets",
        icon: Smartphone,
        href: "/category/mobile",
        subcategories: [
            { name: "Smartphones", href: "/category/mobile?type=phone" },
            { name: "Tablets", href: "/category/mobile?type=tablet" },
            { name: "Wearables", href: "/category/mobile?type=wearable" },
            { name: "Accessories", href: "/category/mobile?type=access" },
        ]
    },
    {
        title: "Computers",
        icon: Laptop,
        href: "/category/computers",
        subcategories: [
            { name: "Laptops", href: "/category/computers?type=laptop" },
            { name: "Desktops", href: "/category/computers?type=desktop" },
            { name: "Monitors", href: "/category/computers?type=monitor" },
            { name: "Components", href: "/category/computers?type=component" },
        ]
    },
];

export default function MegaMenu() {
    return (
        <div className="bg-white border-b border-slate-200 hidden md:block">
            <div className="container mx-auto px-4">
                <NavigationMenu className="max-w-full justify-start">
                    <NavigationMenuList>
                        {categories.map((category) => (
                            <NavigationMenuItem key={category.title}>
                                <NavigationMenuTrigger className="bg-transparent hover:bg-slate-50 text-slate-600 font-medium h-12 rounded-none px-4">
                                    {category.title}
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="grid w-[600px] gap-3 p-4 md:w-[600px] md:grid-cols-2 lg:w-[800px] bg-white">
                                        <div className="row-span-3">
                                            <Link
                                                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-slate-100 to-slate-200 p-6 no-underline outline-none focus:shadow-md"
                                                href={category.href}
                                            >
                                                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white mb-2">
                                                    <category.icon className="h-4 w-4" />
                                                </div>
                                                <div className="mb-2 mt-2 text-lg font-medium text-slate-900">
                                                    {category.title}
                                                </div>
                                                <p className="text-sm leading-tight text-slate-600">
                                                    Explore our wide range of {category.title.toLowerCase()} products.
                                                </p>
                                            </Link>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {category.subcategories.map((sub) => (
                                                <Link
                                                    key={sub.name}
                                                    href={sub.href}
                                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100"
                                                >
                                                    <div className="text-sm font-medium leading-none text-slate-900">{sub.name}</div>
                                                </Link>
                                            ))}
                                            <Link
                                                href={category.href}
                                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-blue-50 focus:bg-blue-50 mt-2 col-span-2"
                                            >
                                                <div className="text-sm font-medium leading-none text-blue-600">View All {category.title} →</div>
                                            </Link>
                                        </div>
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </div>
    );
}
