"use server";

import { query } from "@/lib/db";

export async function getFilterOptions() {
    try {
        // Get distinct categories
        const categories = await query(`
            SELECT DISTINCT category_path 
            FROM products 
            WHERE category_path IS NOT NULL AND category_path != '' 
              AND inventory_strategy != 'DISCONTINUED'
            ORDER BY category_path
        `) as any[];

        // Get price range
        const [priceRange] = await query(`
            SELECT 
                MIN(CAST(price_retail AS DECIMAL(10,2))) as min_price, 
                MAX(CAST(price_retail AS DECIMAL(10,2))) as max_price
            FROM products
            WHERE inventory_strategy != 'DISCONTINUED'
        `) as any[];

        return {
            categories: categories.map(c => c.category_path).filter(Boolean),
            priceRange: {
                min: Number(priceRange?.min_price) || 0,
                max: Number(priceRange?.max_price) || 100000
            }
        };
    } catch (e) {
        console.error("Get Filter Options Error:", e);
        return { categories: [], priceRange: { min: 0, max: 100000 } };
    }
}

export async function getFilteredProducts(filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'name' | 'newest';
    page?: number;
    limit?: number;
}) {
    try {
        const { category, minPrice, maxPrice, search, sortBy = 'name', page = 1, limit = 16 } = filters;

        const whereClauses = ["inventory_strategy != 'DISCONTINUED'"];
        const params: any[] = [];

        if (category) {
            whereClauses.push("category_path = ?");
            params.push(category);
        }

        if (minPrice !== undefined) {
            whereClauses.push("CAST(price_retail AS DECIMAL(10,2)) >= ?");
            params.push(minPrice);
        }

        if (maxPrice !== undefined) {
            whereClauses.push("CAST(price_retail AS DECIMAL(10,2)) <= ?");
            params.push(maxPrice);
        }

        if (search) {
            whereClauses.push("(name LIKE ? OR sku LIKE ? OR description LIKE ?)");
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // Sorting
        let orderBy = 'name ASC';
        switch (sortBy) {
            case 'price_asc': orderBy = 'CAST(price_retail AS DECIMAL(10,2)) ASC'; break;
            case 'price_desc': orderBy = 'CAST(price_retail AS DECIMAL(10,2)) DESC'; break;
            case 'newest': orderBy = 'created_at DESC'; break;
            case 'name': default: orderBy = 'name ASC';
        }

        // Count total
        const [countResult] = await query(`SELECT COUNT(*) as total FROM products ${whereSQL}`, params) as any[];
        const total = countResult?.total || 0;

        // Get products with pagination
        const offset = (page - 1) * limit;
        const products = await query(`
            SELECT 
                p.id, p.name, p.sku, p.description, p.category_path,
                p.price_retail, p.price_sale, p.image,
                COALESCE(SUM(l.delta), 0) as stock
            FROM products p
            LEFT JOIN inventory_ledger l ON p.id = l.product_id
            ${whereSQL}
            GROUP BY p.id
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `, [...params, limit.toString(), offset.toString()]) as any[];

        return {
            products: products.map(p => ({
                id: p.id,
                name: p.name,
                sku: p.sku,
                description: p.description,
                category: p.category_path,
                price: Number(p.price_sale) > 0 ? Number(p.price_sale) : Number(p.price_retail),
                price_retail: Number(p.price_retail),
                price_sale: Number(p.price_sale),
                image: p.image,
                stock: Number(p.stock)
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    } catch (e) {
        console.error("Get Filtered Products Error:", e);
        return { products: [], total: 0, page: 1, totalPages: 0 };
    }
}
