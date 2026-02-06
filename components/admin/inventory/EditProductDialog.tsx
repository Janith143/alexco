"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { updateProduct } from "@/server-actions/admin/inventory";

interface EditProductDialogProps {
    product: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function EditProductDialog({ product, open, onOpenChange, onSuccess }: EditProductDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper to format variations object back to string
    const formatVariations = (variations: any) => {
        if (!variations) return "";
        try {
            // Handle both string JSON and object
            const vars = typeof variations === 'string' ? JSON.parse(variations) : variations;
            return Object.entries(vars)
                .map(([key, vals]: [string, any]) => `${key}=${Array.isArray(vals) ? vals.join(',') : vals}`)
                .join('; ');
        } catch (e) {
            return "";
        }
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!product) return;

        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            sku: formData.get('sku'),
            price: formData.get('price'),
            category: formData.get('category'),
            description: formData.get('description'),
            long_description: formData.get('long_description'),
            variations_raw: formData.get('variations_raw'),
            price_cost: formData.get('price_cost'),
            price_sale: formData.get('price_sale'),
            weight_g: formData.get('weight_g')
        };

        const result = await updateProduct(product.id, data);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setLoading(false);
            onSuccess();
        }
    }

    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Product: {product.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Product Name *</label>
                            <Input name="name" required defaultValue={product.name} />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">SKU (Unique) *</label>
                            <Input name="sku" required defaultValue={product.sku} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Category *</label>
                            <Select name="category" required defaultValue={product.category_path}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Solar">Solar</SelectItem>
                                    <SelectItem value="Electrical">Electrical</SelectItem>
                                    <SelectItem value="Smart Home">Smart Home</SelectItem>
                                    <SelectItem value="Services">Services</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Retail Price (LKR) *</label>
                            <Input name="price" type="number" min="0" step="0.01" required defaultValue={product.price_retail} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-md border">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-slate-700">Cost Price <span className="text-xs text-slate-400">(Internal)</span></label>
                            <Input name="price_cost" type="number" min="0" step="0.01" defaultValue={product.price_cost} />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-slate-700">Sale Price <span className="text-xs text-slate-400">(Optional)</span></label>
                            <Input name="price_sale" type="number" min="0" step="0.01" defaultValue={product.price_sale} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Short Description</label>
                        <textarea
                            name="description"
                            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Brief summary..."
                            defaultValue={product.description}
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Long Description</label>
                        <textarea
                            name="long_description"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Detailed product story..."
                            defaultValue={product.long_description}
                        />
                    </div>

                    <div className="grid gap-2 p-3 bg-slate-50 rounded-md border text-sm">
                        <label className="font-semibold text-slate-700">Variations</label>
                        <p className="text-xs text-slate-500 mb-2">Format: Key=Value1,Time2 (e.g. Color=Red,Blue)</p>
                        <Input name="variations_raw" placeholder="Color=Red,Blue; Size=Small,Large" defaultValue={formatVariations(product.variations)} />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Weight (grams)</label>
                        <Input name="weight_g" type="number" min="0" defaultValue={product.weight_g || 0} placeholder="e.g. 500" />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
