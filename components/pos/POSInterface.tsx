"use client";

import React, { useState, useEffect } from "react";
import ProductGrid from "./ProductGrid";
import CheckoutDialog from "./CheckoutDialog";
import OrderHistorySheet from "./OrderHistorySheet";
import CartSidebar from "./CartSidebar";
import { Trash2, Plus, Minus, ShoppingCart, Printer, History, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSalesOrder } from "@/server-actions/pos/orders";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface CartItem {
    id: string; // Product ID
    sku: string;
    name: string;
    price: number;
    quantity: number;
}

export default function POSInterface() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [lastOrderNumber, setLastOrderNumber] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isCartSheetOpen, setIsCartSheetOpen] = useState(false); // Mobile cart sheet state
    const { toast } = useToast();

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prev, {
                    id: product.id,
                    sku: product.sku,
                    name: product.name,
                    price: product.price,
                    quantity: 1
                }];
            }
        });
        toast({
            title: "Added to cart",
            description: `${product.name} added.`,
            duration: 1500,
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const taxRate = 0; // Assuming inclusive for now, or 0 if separate
    const total = subtotal;

    const handleCheckoutComplete = async (method: string, tenderAmount?: number) => {
        const orderData = {
            items: cart.map(i => ({ productId: i.id, price: i.price, quantity: i.quantity })),
            total: total,
            paymentMethod: method
        };

        const result = await createSalesOrder(orderData);

        if (result.success) {
            toast({
                title: "Sale Completed",
                description: `Order #${result.orderNumber} created successfully.`,
                action: (
                    <ToastAction onClick={() => window.open(`/paths/POS/print/${result.orderNumber}`, '_blank', 'width=400,height=600')}>
                        Print Receipt
                    </ToastAction>
                ),
            });
            setCart([]);
            setLastOrderNumber(result.orderNumber || null);
            setIsCheckoutOpen(false);
            setIsCartSheetOpen(false); // Close mobile cart sheet on success
        } else {
            toast({
                title: "Error",
                description: "Failed to process sale. Please try again.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden relative">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <header className="bg-white border-b px-4 py-3 md:px-6 md:py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg md:text-xl font-bold text-slate-800">POS Terminal</h1>
                        {lastOrderNumber && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-2 bg-slate-100 border-slate-200 text-slate-600 hover:text-blue-600 hidden md:flex"
                                onClick={() => window.open(`/paths/POS/print/${lastOrderNumber}`, '_blank', 'width=400,height=600')}
                            >
                                <Printer className="h-4 w-4" /> Last Receipt
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2"
                            onClick={() => setIsHistoryOpen(true)}
                        >
                            <History className="h-4 w-4" /> <span className="hidden sm:inline">History</span>
                        </Button>

                        {/* Mobile Cart Toggle */}
                        <div className="lg:hidden">
                            <Sheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-8 w-8 relative">
                                        <ShoppingCart className="h-4 w-4" />
                                        {cart.length > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                                {cart.length}
                                            </span>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-full sm:w-[400px] p-0 border-l">
                                    <CartSidebar
                                        cart={cart}
                                        onRemove={removeFromCart}
                                        onUpdateQuantity={updateQuantity}
                                        onCheckout={() => setIsCheckoutOpen(true)}
                                        subtotal={subtotal}
                                        total={total}
                                        className="h-full border-none shadow-none"
                                    />
                                </SheetContent>
                            </Sheet>
                        </div>

                        <div className="text-sm text-slate-500 hidden sm:block">
                            {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </header>

                {/* Product Grid Area */}
                <div className="flex-1 overflow-hidden relative">
                    <ProductGrid onAddToCart={addToCart} />

                    {/* Floating Mobile Checkout Bar (Visible only on mobile when cart has items) */}
                    <div className="lg:hidden absolute bottom-4 left-4 right-4 z-20">
                        {cart.length > 0 && (
                            <Button
                                size="lg"
                                className="w-full shadow-xl bg-slate-900 border-t border-slate-800 text-white flex justify-between px-6 py-6 rounded-xl hover:bg-slate-800 transition-all animate-in slide-in-from-bottom-4"
                                onClick={() => setIsCartSheetOpen(true)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-800 px-2 py-1 rounded text-xs font-bold text-slate-300">
                                        {cart.length} ITEMS
                                    </div>
                                    <span className="font-medium">View Cart</span>
                                </div>
                                <div className="font-bold text-lg">
                                    LKR {total.toLocaleString()}
                                </div>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop Cart Sidebar (Hidden on mobile) */}
            <div className="hidden lg:block w-[400px] h-full z-10">
                <CartSidebar
                    cart={cart}
                    onRemove={removeFromCart}
                    onUpdateQuantity={updateQuantity}
                    onCheckout={() => setIsCheckoutOpen(true)}
                    subtotal={subtotal}
                    total={total}
                />
            </div>

            <CheckoutDialog
                open={isCheckoutOpen}
                onOpenChange={setIsCheckoutOpen}
                total={total}
                onComplete={handleCheckoutComplete}
            />
            <OrderHistorySheet
                open={isHistoryOpen}
                onOpenChange={setIsHistoryOpen}
            />
        </div>
    );
}
