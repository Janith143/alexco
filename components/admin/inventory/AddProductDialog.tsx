"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { createProduct } from "@/server-actions/admin/inventory";

interface AddProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function AddProductDialog({ open, onOpenChange, onSuccess }: AddProductDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [specs, setSpecs] = useState<{ key: string, value: string }[]>([]);
    const [boxItems, setBoxItems] = useState<string[]>([]);
    const [features, setFeatures] = useState<string[]>([]);

    const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
    const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
    const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = val;
        setSpecs(newSpecs);
    };

    const addBoxItem = () => setBoxItems([...boxItems, ""]);
    const removeBoxItem = (index: number) => setBoxItems(boxItems.filter((_, i) => i !== index));
    const updateBoxItem = (index: number, val: string) => {
        const newItems = [...boxItems];
        newItems[index] = val;
        setBoxItems(newItems);
    };

    const addFeature = () => setFeatures([...features, ""]);
    const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));
    const updateFeature = (index: number, val: string) => {
        const newFeatures = [...features];
        newFeatures[index] = val;
        setFeatures(newFeatures);
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        // Convert specs array to object
        const specsObj = specs.reduce((acc, curr) => {
            if (curr.key && curr.value) acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        const data = {
            name: formData.get('name'),
            sku: formData.get('sku'),
            price: formData.get('price'),
            category: formData.get('category'),
            initialStock: formData.get('initialStock'),
            description: formData.get('description'),
            long_description: formData.get('long_description'),
            variations_raw: formData.get('variations_raw'),
            price_cost: formData.get('price_cost'),
            price_sale: formData.get('price_sale'),
            weight_g: formData.get('weight_g'),
            specifications: JSON.stringify(specsObj),
            whats_included: JSON.stringify(boxItems.filter(i => i.trim())),
            features: JSON.stringify(features.filter(f => f.trim()))
        };

        const result = await createProduct(data);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setLoading(false);
            onSuccess();
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        {/* LEFT COLUMN: Basic Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900 border-b pb-2">Basic Info</h3>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Product Name *</label>
                                <Input name="name" required placeholder="e.g. 5kW Inverter" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">SKU (Unique) *</label>
                                <Input name="sku" required placeholder="e.g. SOL-INV-5K" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Category *</label>
                                <Select name="category" required>
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Retail Price *</label>
                                    <Input name="price" type="number" min="0" step="0.01" required placeholder="0.00" />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Sale Price</label>
                                    <Input name="price_sale" type="number" min="0" step="0.01" placeholder="0.00" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Cost Price (Internal)</label>
                                <Input name="price_cost" type="number" min="0" step="0.01" placeholder="0.00" />
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Short Description</label>
                                <textarea
                                    name="description"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Brief summary..."
                                />
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Details & Specs */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900 border-b pb-2">Details & Inventory</h3>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Long Description</label>
                                <textarea
                                    name="long_description"
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Detailed product story..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Initial Stock</label>
                                    <Input name="initialStock" type="number" min="0" defaultValue="0" />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Weight (g)</label>
                                    <Input name="weight_g" type="number" min="0" defaultValue="0" />
                                </div>
                            </div>

                            <div className="grid gap-2 p-3 bg-slate-50 rounded-md border text-sm">
                                <label className="font-semibold text-slate-700">Variations</label>
                                <Input name="variations_raw" placeholder="Color=Red,Blue; Size=S,M" />
                            </div>

                            {/* Dynamic Specifications */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex justify-between">
                                    Specifications
                                    <Button type="button" variant="ghost" size="sm" onClick={addSpec} className="h-6 text-blue-600">+ Add</Button>
                                </label>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                    {specs.map((spec, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <Input placeholder="Key" value={spec.key} onChange={(e) => updateSpec(idx, 'key', e.target.value)} className="h-8" />
                                            <Input placeholder="Value" value={spec.value} onChange={(e) => updateSpec(idx, 'value', e.target.value)} className="h-8" />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(idx)} className="h-8 w-8 text-red-500 hover:text-red-700">×</Button>
                                        </div>
                                    ))}
                                    {specs.length === 0 && <p className="text-xs text-slate-400 italic">No specifications added.</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM SECTION: Features & Box Content */}
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex justify-between">
                                Key Features
                                <Button type="button" variant="ghost" size="sm" onClick={addFeature} className="h-6 text-blue-600">+ Add</Button>
                            </label>
                            {features.map((feat, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <Input value={feat} onChange={(e) => updateFeature(idx, e.target.value)} className="h-8" placeholder="Feature..." />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(idx)} className="h-8 w-8 text-red-500">×</Button>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex justify-between">
                                What's in the Box
                                <Button type="button" variant="ghost" size="sm" onClick={addBoxItem} className="h-6 text-blue-600">+ Add</Button>
                            </label>
                            {boxItems.map((item, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <Input value={item} onChange={(e) => updateBoxItem(idx, e.target.value)} className="h-8" placeholder="Item..." />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeBoxItem(idx)} className="h-8 w-8 text-red-500">×</Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Product'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
