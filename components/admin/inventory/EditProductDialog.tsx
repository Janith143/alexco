"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { updateProduct } from "@/server-actions/admin/inventory";
import ImageUpload from "@/components/admin/ImageUpload";

interface EditProductDialogProps {
    product: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function EditProductDialog({ product, open, onOpenChange, onSuccess }: EditProductDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<{ id: string, name: string, slug: string, parent_id: string | null }[]>([]);

    useEffect(() => {
        if (open) {
            import("@/server-actions/admin/categories").then(({ getCategories }) => {
                getCategories(true).then((cats) => {
                    // Flatten for select
                    const flat: any[] = [];
                    const traverse = (items: any[]) => {
                        items.forEach(i => {
                            flat.push(i);
                            if (i.children) traverse(i.children);
                        });
                    };
                    traverse(cats);
                    setCategories(flat);
                });
            });
        }
    }, [open]);

    const [specs, setSpecs] = useState<{ key: string, value: string }[]>([]);
    const [boxItems, setBoxItems] = useState<string[]>([]);
    const [features, setFeatures] = useState<string[]>([]);
    const [gallery, setGallery] = useState<string[]>([]);

    useEffect(() => {
        if (product) {
            // Parse Specs
            try {
                const s = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications || {};
                setSpecs(Object.entries(s).map(([key, value]) => ({ key, value: String(value) })));
            } catch (e) { setSpecs([]); }

            // Parse Box Items
            try {
                const b = typeof product.whats_included === 'string' ? JSON.parse(product.whats_included) : product.whats_included || [];
                setBoxItems(Array.isArray(b) ? b : []);
            } catch (e) { setBoxItems([]); }

            try {
                const f = typeof product.features === 'string' ? JSON.parse(product.features) : product.features || [];
                setFeatures(Array.isArray(f) ? f : []);
            } catch (e) { setFeatures([]); }

            // Parse Gallery
            try {
                const g = product.gallery ? (typeof product.gallery === 'string' ? JSON.parse(product.gallery) : product.gallery) : [];
                if (Array.isArray(g) && g.length > 0) {
                    setGallery(g);
                } else if (product.image) {
                    setGallery([product.image]);
                } else {
                    setGallery([]);
                }
            } catch (e) { setGallery([]); }
        }
    }, [product]);

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
            description: formData.get('description'),
            long_description: formData.get('long_description'),
            variations_raw: formData.get('variations_raw'),
            price_cost: formData.get('price_cost'),
            price_sale: formData.get('price_sale'),
            weight_g: formData.get('weight_g'),
            specifications: JSON.stringify(specsObj),
            whats_included: JSON.stringify(boxItems.filter(i => i.trim())),
            features: JSON.stringify(features.filter(f => f.trim())),
            gallery: gallery
        };

        try {
            const result = await updateProduct(product.id, data);

            if (result.error) {
                setError(result.error);
            } else {
                onSuccess();
            }
        } catch (error) {
            console.error(error);
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }

    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Product: {product.name}</DialogTitle>
                    <DialogDescription>
                        Update the product details and inventory settings.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Product Images (First is Main)</label>
                        <ImageUpload
                            value={gallery}
                            onChange={setGallery}
                            onRemove={(url) => setGallery(gallery.filter(g => g !== url))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* LEFT COLUMN: Basic Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900 border-b pb-2">Basic Info</h3>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Product Name *</label>
                                <Input name="name" required defaultValue={product.name} />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">SKU (Unique) *</label>
                                <Input name="sku" required defaultValue={product.sku} />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Category *</label>
                                <Select name="category" required defaultValue={product.category_path}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.slug || cat.name}>
                                                {cat.parent_id ? `— ${cat.name}` : cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Retail Price *</label>
                                    <Input name="price" type="number" min="0" step="0.01" required defaultValue={product.price_retail} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Sale Price</label>
                                    <Input name="price_sale" type="number" min="0" step="0.01" defaultValue={product.price_sale} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Cost Price (Internal)</label>
                                <Input name="price_cost" type="number" min="0" step="0.01" defaultValue={product.price_cost} />
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Short Description</label>
                                <textarea
                                    name="description"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Brief summary..."
                                    defaultValue={product.description}
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
                                    defaultValue={product.long_description}
                                />
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Weight (grams)</label>
                                <Input name="weight_g" type="number" min="0" defaultValue={product.weight_g || 0} placeholder="e.g. 500" />
                            </div>

                            <div className="grid gap-2 p-3 bg-slate-50 rounded-md border text-sm">
                                <label className="font-semibold text-slate-700">Variations</label>
                                <Input name="variations_raw" placeholder="Color=Red,Blue; Size=Small,Large" defaultValue={formatVariations(product.variations)} />
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
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
