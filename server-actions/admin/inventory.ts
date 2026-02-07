"use server";

import { query } from "@/lib/db";

export type InventoryConflict = {
    productId: string;
    productName: string;
    sku: string;
    stockLevel: number; // Will be negative
    lastTransactionId: string;
};

export async function getInventoryConflicts(): Promise<InventoryConflict[]> {
    try {
        // A simplified conflict check: sum of ledger is negative
        const rows = await query(`
      SELECT p.id, p.name, p.sku, SUM(l.delta) as current_stock
      FROM products p
      JOIN inventory_ledger l ON p.id = l.product_id
      GROUP BY p.id
      HAVING current_stock < 0
    `) as any[];

        return rows.map(r => ({
            productId: r.id,
            productName: r.name,
            sku: r.sku,
            stockLevel: Number(r.current_stock),
            lastTransactionId: "unknown" // In real app, would fetch last ledger entry
        }));
    } catch (err) {
        console.error("Failed to fetch conflicts:", err);
        return [];
    }
}

export async function resolveConflict(productId: string, resolution: "BACKORDER" | "REFUND" | "ADJUST", amount: number) {
    try {
        console.log(`Resolving conflict for ${productId} with ${resolution} of ${amount}`);

        let delta = 0;
        let reason = "";

        if (resolution === 'ADJUST' || resolution === 'BACKORDER') {
            // Add stock to bring it to 0 or positive. 
            // BUT wait, if we are "Backordering", it means we are acknowledging the negative stock and maybe moving it to a "Pending" bucket?
            // For simplicity in Phase 5: "Resolve" just means "Add Adjustment Stock" to balance the books, assuming we sourced the item physically or cancelled an order.

            delta = amount; // Should be positive to fix negative
            reason = `ADMIN_RES_${resolution}`;
        }

        if (delta !== 0) {
            const { v4: uuidv4 } = await import('uuid');
            // Fetch a location (Main Store)
            const [loc] = await query("SELECT id FROM locations LIMIT 1") as any[];
            const locId = loc.id;

            await query(`
                INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code, reference_doc)
                VALUES (?, ?, ?, ?, ?, 'ADMIN_FIX')
             `, [uuidv4(), productId, locId, delta, reason]);
        }

        return { success: true };

    } catch (err) {
        console.error("Resolution failed:", err);
        return { success: false, error: "Failed to resolve" };
    }
}

// --- New Features for Phase 5 Completion ---

export async function getInventoryList(search?: string) {
    let sql = `
        SELECT 
            p.id, p.sku, p.name, p.category_path, p.price_retail, p.price_cost, p.price_sale,
            p.weight_g, p.description, p.long_description, p.variations,
            COALESCE(SUM(l.delta), 0) as current_stock
        FROM products p
        LEFT JOIN inventory_ledger l ON p.id = l.product_id
    `;

    const params: any[] = [];

    if (search) {
        sql += ` WHERE p.name LIKE ? OR p.sku LIKE ? `;
        params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` GROUP BY p.id ORDER BY p.name ASC LIMIT 50`;

    const rows = await query(sql, params) as any[];
    return rows;
}

export async function createProduct(data: any) {
    const {
        name, sku, price, category, initialStock, description, long_description,
        variations_raw, price_cost, price_sale, weight_g,
        specifications, whats_included, features
    } = data;
    const { v4: uuidv4 } = await import('uuid');

    const productId = uuidv4();

    // Parse variations string "Color=Red,Blue; Size=S,M" -> { "Color": ["Red", "Blue"], "Size": ["S", "M"] }
    let variations = {};
    if (variations_raw && typeof variations_raw === 'string') {
        try {
            variations = variations_raw.split(';').reduce((acc: any, part) => {
                const [key, values] = part.split('=').map(s => s.trim());
                if (key && values) {
                    acc[key] = values.split(',').map(v => v.trim());
                }
                return acc;
            }, {});
        } catch (e) {
            console.error("Failed to parse variations:", e);
        }
    }

    try {
        // 1. Create Product
        await query(`
            INSERT INTO products (
                id, sku, name, category_path, price_retail, price_cost, price_sale, tax_code, 
                description, long_description, variations, specifications, whats_included, features, weight_g
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'VAT_18', ?, ?, ?, ?, ?, ?, ?)
        `, [
            productId, sku, name, category, price,
            price_cost || 0,
            price_sale || 0,
            description || '',
            long_description || '',
            JSON.stringify(variations),
            specifications || JSON.stringify({}),
            whats_included || JSON.stringify([]),
            features || JSON.stringify([]),
            Number(weight_g) || 0
        ]);

        // 2. Initial Stock (if > 0)
        if (Number(initialStock) > 0) {
            const [loc] = await query("SELECT id FROM locations LIMIT 1") as any[]; // Default location
            if (loc) {
                await query(`
                    INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code, reference_doc)
                    VALUES (?, ?, ?, ?, 'INITIAL_STOCK', 'SETUP')
                `, [uuidv4(), productId, loc.id, initialStock]);
            }
        }

        // Revalidate storefront and admin paths
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/paths/admin/inventory');
        revalidatePath('/shop'); // Update store too

        return { success: true };
    } catch (e: any) {
        console.error("Create Product Error:", e);
        if (e.code === 'ER_DUP_ENTRY') {
            return { error: 'SKU already exists' };
        }
        return { error: 'Failed to create product' };
    }
}

export async function adjustStock(productId: string, delta: number, reason: string) {
    const { v4: uuidv4 } = await import('uuid');
    try {
        const [loc] = await query("SELECT id FROM locations LIMIT 1") as any[];
        if (!loc) return { error: 'No location configured' };

        await query(`
            INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code, reference_doc)
            VALUES (?, ?, ?, ?, ?, 'ADMIN_ADJ')
        `, [uuidv4(), productId, loc.id, delta, reason]);

        const { revalidatePath } = await import('next/cache');
        revalidatePath('/paths/admin/inventory');

        return { success: true };
    } catch (e) {
        console.error("Stock Adjust Error:", e);
        return { error: 'Failed to adjust stock' };
    }
}

export async function deleteProduct(productId: string) {
    try {
        // Check for sales history
        const [salesCheck] = await query(`
            SELECT COUNT(*) as count FROM sales_items WHERE product_id = ?
        `, [productId]) as any[];

        if (salesCheck.count > 0) {
            return { success: false, error: 'Cannot delete product with existing sales history. Set stock to 0 or archive it instead (Archiving not yet implemented).' };
        }

        // Delete inventory ledger entries
        await query(`
            DELETE FROM inventory_ledger WHERE product_id = ?
        `, [productId]);

        // Delete the product
        await query(`
            DELETE FROM products WHERE id = ?
        `, [productId]);

        const { revalidatePath } = await import('next/cache');
        revalidatePath('/paths/admin/inventory');
        revalidatePath('/shop');

        return { success: true };
    } catch (e: any) {
        console.error("Delete Product Error:", e);
        return { success: false, error: e.message || 'Failed to delete product' };
    }
}

export async function updateProduct(id: string, data: any) {
    const {
        name, sku, price, category, description, long_description,
        variations_raw, price_cost, price_sale, weight_g,
        specifications, whats_included, features
    } = data;

    // Parse variations string "Color=Red,Blue; Size=S,M" -> { "Color": ["Red", "Blue"], "Size": ["S", "M"] }
    let variations = {};
    if (variations_raw && typeof variations_raw === 'string') {
        try {
            variations = variations_raw.split(';').reduce((acc: any, part) => {
                const [key, values] = part.split('=').map(s => s.trim());
                if (key && values) {
                    acc[key] = values.split(',').map(v => v.trim());
                }
                return acc;
            }, {});
        } catch (e) {
            console.error("Failed to parse variations:", e);
        }
    }

    try {
        await query(`
            UPDATE products SET
                sku = ?, name = ?, category_path = ?, price_retail = ?, price_cost = ?, price_sale = ?, 
                description = ?, long_description = ?, variations = ?, weight_g = ?,
                specifications = ?, whats_included = ?, features = ?
            WHERE id = ?
        `, [
            sku, name, category, price,
            price_cost || 0,
            price_sale || 0,
            description || '',
            long_description || '',
            JSON.stringify(variations),
            Number(weight_g) || 0,
            specifications || JSON.stringify({}),
            whats_included || JSON.stringify([]),
            features || JSON.stringify([]),
            id
        ]);

        const { revalidatePath } = await import('next/cache');
        revalidatePath('/paths/admin/inventory');
        revalidatePath('/shop');

        return { success: true };
    } catch (e: any) {
        console.error("Update Product Error:", e);
        if (e.code === 'ER_DUP_ENTRY') {
            return { error: 'SKU already exists' };
        }
        return { error: 'Failed to update product' };
    }
}
