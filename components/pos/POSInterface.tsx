"use client";

import React, { useState, useEffect } from "react";
import ProductGrid from "./ProductGrid";
import CheckoutDialog from "./CheckoutDialog";
import OrderHistorySheet from "./OrderHistorySheet";
import { Trash2, Plus, Minus, ShoppingCart, Printer, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSalesOrder } from "@/server-actions/pos/orders";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

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
        } else {
            toast({
                title: "Error",
                description: "Failed to process sale. Please try again.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* Left: Product Grid */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-slate-800">POS Terminal</h1>
                        {lastOrderNumber && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-2 bg-slate-100 border-slate-200 text-slate-600 hover:text-blue-600"
                                onClick={() => window.open(`/paths/POS/print/${lastOrderNumber}`, '_blank', 'width=400,height=600')}
                            >
                                <Printer className="h-4 w-4" /> Last Receipt
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2"
                            onClick={() => setIsHistoryOpen(true)}
                        >
                            <History className="h-4 w-4" /> History
                        </Button>
                        <div className="text-sm text-slate-500">
                            {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-hidden">
                    <ProductGrid onAddToCart={addToCart} />
                </div>
            </div>

            {/* Right: Cart */}
            <div className="w-[400px] flex flex-col bg-white border-l border-slate-200 shadow-xl z-10">
                <div className="p-4 bg-slate-50 border-b flex items-center gap-2 text-slate-700 font-semibold">
                    <ShoppingCart className="h-5 w-5" />
                    Current Order ({cart.length})
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="text-center text-slate-400 mt-20">
                            <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>Cart is empty</p>
                        </div>
                    ) : cart.map((item) => (
                        <div key={item.id} className="flex gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                            <div className="flex-1">
                                <div className="font-medium text-slate-900 line-clamp-1">{item.name}</div>
                                <div className="text-xs text-slate-500 font-mono mb-2">{item.sku}</div>
                                <div className="text-sm font-bold text-blue-600">LKR {item.price.toLocaleString()}</div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => removeFromCart(item.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-2 bg-slate-100 rounded-md p-0.5">
                                    <button
                                        className="h-7 w-7 flex items-center justify-center hover:bg-white rounded-md transition-colors"
                                        onClick={() => updateQuantity(item.id, -1)}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                                    <button
                                        className="h-7 w-7 flex items-center justify-center hover:bg-white rounded-md transition-colors"
                                        onClick={() => updateQuantity(item.id, 1)}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Totals Section */}
                <div className="p-6 bg-slate-50 border-t space-y-4">
                    <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>LKR {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax</span>
                            <span>Included</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-end border-t border-slate-200 pt-4">
                        <span className="text-lg font-bold text-slate-900">Total</span>
                        <span className="text-2xl font-bold text-blue-600">LKR {total.toLocaleString()}</span>
                    </div>

                    <Button
                        size="lg"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                        disabled={cart.length === 0}
                        onClick={() => setIsCheckoutOpen(true)}
                    >
                        Checkout
                    </Button>
                </div>
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
