"use server";

import { query } from "@/lib/db";

export async function getPosProducts() {
    try {
        const rows = await query(`
      SELECT 
        p.id, 
        p.name, 
        p.price_retail as price, 
        p.category_path as category, 
        p.sku,
        COALESCE(SUM(l.delta), 0) as stock_qty
      FROM products p
      LEFT JOIN inventory_ledger l ON p.id = l.product_id
      WHERE p.inventory_strategy != 'DISCONTINUED'
      GROUP BY p.id
    `) as any[];

        // Map to RxDB expected format
        return rows.map(p => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            category: p.category,
            sku: p.sku,
            stock: Number(p.stock_qty) || 0
        }));
    } catch (err) {
        console.error("POS Fetch Error:", err);
        throw new Error("Failed to fetch products for POS");
    }
}

