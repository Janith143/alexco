"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
    images: string[];
    name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(images[0]);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                <span className="text-6xl grayscale opacity-20">📦</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden relative group">
                <Image
                    src={selectedImage}
                    alt={name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    unoptimized={selectedImage.startsWith('/uploads')}
                />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedImage(img)}
                            className={cn(
                                "relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                                selectedImage === img ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`${name} view ${idx + 1}`}
                                fill
                                className="object-cover"
                                unoptimized={img.startsWith('/uploads')}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
