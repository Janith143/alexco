"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Smartphone, Laptop, Tv, Speaker, Home, Watch, Gamepad2, Wifi, Cpu, Sun, Zap, Battery, Lightbulb } from "lucide-react";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { getStoreCategories, StoreCategory } from "@/server-actions/store/categories";

// Map generic icons to category names (simple heuristic)
const iconMap: Record<string, any> = {
    "solar": Sun,
    "electrical": Zap,
    "batteries": Battery,
    "lighting": Lightbulb,
    "smart": Smartphone,
    "computers": Laptop,
};

export default function MegaMenu() {
    const [categories, setCategories] = useState<StoreCategory[]>([]);

    useEffect(() => {
        getStoreCategories().then(setCategories);
    }, []);

    const getIcon = (slug: string) => {
        const key = Object.keys(iconMap).find(k => slug.includes(k));
        return key ? iconMap[key] : Home;
    };

    return (
        <div className="bg-white border-b border-slate-200 hidden md:block">
            <div className="container mx-auto px-4">
                <NavigationMenu className="max-w-full justify-start">
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <Link href="/shop" legacyBehavior passHref>
                                <NavigationMenuLink className="group inline-flex h-12 w-max items-center justify-center rounded-none px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-slate-50 data-[state=open]:bg-slate-50 text-slate-600">
                                    All Products
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        {categories.map((category) => {
                            const Icon = getIcon(category.slug);
                            return (
                                <NavigationMenuItem key={category.id}>
                                    <NavigationMenuTrigger className="bg-transparent hover:bg-slate-50 text-slate-600 font-medium h-12 rounded-none px-4">
                                        {category.name}
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <div className="grid w-[600px] gap-3 p-4 md:w-[600px] md:grid-cols-2 lg:w-[800px] bg-white">
                                            <div className="row-span-3">
                                                <Link
                                                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-slate-100 to-slate-200 p-6 no-underline outline-none focus:shadow-md"
                                                    href={`/shop?category=${category.slug}`}
                                                >
                                                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white mb-2">
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="mb-2 mt-2 text-lg font-medium text-slate-900">
                                                        {category.name}
                                                    </div>
                                                    <p className="text-sm leading-tight text-slate-600">
                                                        {category.description || `Explore our wide range of ${category.name.toLowerCase()} products.`}
                                                    </p>
                                                </Link>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {category.children && category.children.map((sub) => (
                                                    <Link
                                                        key={sub.id}
                                                        href={`/shop?category=${sub.slug}`}
                                                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100"
                                                    >
                                                        <div className="text-sm font-medium leading-none text-slate-900">{sub.name}</div>
                                                    </Link>
                                                ))}
                                                <Link
                                                    href={`/shop?category=${category.slug}`}
                                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-blue-50 focus:bg-blue-50 mt-2 col-span-2"
                                                >
                                                    <div className="text-sm font-medium leading-none text-blue-600">View All {category.name} →</div>
                                                </Link>
                                            </div>
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            );
                        })}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </div>
    );
}
