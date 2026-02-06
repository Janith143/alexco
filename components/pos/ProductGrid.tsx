"use client";

import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPosProducts } from "@/server-actions/pos/products";

interface Product {
    id: string;
    sku: string;
    name: string;
    price: number;
    category: string;
    stock: number;
}

interface ProductGridProps {
    onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ onAddToCart }: ProductGridProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    useEffect(() => {
        async function load() {
            try {
                const data = await getPosProducts();
                setProducts(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Extract unique categories
    const categories = ["All", ...Array.from(new Set(products.map(p => p.category?.split('/')[0] || "Uncategorized")))];

    // Filter logic
    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase());
        const matchesCat = category === "All" || (p.category && p.category.startsWith(category));
        return matchesSearch && matchesCat;
    });

    return (
        <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200">
            {/* Search Header */}
            <div className="p-4 bg-white border-b border-slate-200 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by Name or SKU..."
                        className="pl-9 bg-slate-100 border-0"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Tabs value={category} onValueChange={setCategory} className="w-full">
                    <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-transparent gap-2 no-scrollbar">
                        {categories.map(cat => (
                            <TabsTrigger
                                key={cat}
                                value={cat}
                                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white bg-white border px-4 py-1.5 rounded-full text-xs"
                            >
                                {cat}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Grid */}
            <ScrollArea className="flex-1 p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
                        {filtered.map(product => (
                            <button
                                key={product.id}
                                onClick={() => product.stock > 0 && onAddToCart(product)}
                                disabled={product.stock <= 0}
                                className={`flex flex-col text-left bg-white p-3 rounded-xl border shadow-sm transition-all relative ${product.stock <= 0
                                        ? 'border-slate-200 opacity-60 cursor-not-allowed'
                                        : 'border-slate-200 hover:shadow-md hover:border-blue-300 active:scale-95'
                                    }`}
                            >
                                {/* Stock Badge */}
                                {product.stock <= 0 ? (
                                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                        OOS
                                    </div>
                                ) : (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-medium px-2 py-0.5 rounded">
                                        {product.stock} in stock
                                    </div>
                                )}

                                <div className="h-20 w-full bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-2xl font-bold text-slate-300 select-none">
                                    {product.name.charAt(0)}
                                </div>
                                <div className="font-semibold text-slate-800 text-sm line-clamp-2 leading-tight mb-1">
                                    {product.name}
                                </div>
                                <div className="text-xs text-slate-400 mb-2 font-mono">
                                    {product.sku}
                                </div>
                                <div className="mt-auto font-bold text-blue-600">
                                    LKR {product.price.toLocaleString()}
                                </div>
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <div className="col-span-full text-center py-10 text-slate-400">
                                No products found.
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
