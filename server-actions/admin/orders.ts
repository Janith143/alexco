"use server";

import { query } from "@/lib/db";

export async function getOnlineOrders(statusFilter: string = "ALL") {
    try {
        let sql = `
            SELECT id, order_number, total_amount, payment_method, delivery_method, status, delivery_status, customer_name, customer_phone, customer_email, payment_proof, created_at, shipping_address
            FROM sales_orders
            WHERE order_source = 'ONLINE'
        `;
        const params: any[] = [];

        if (statusFilter !== "ALL") {
            sql += ` AND delivery_status = ?`;
            params.push(statusFilter);
        }

        sql += ` ORDER BY created_at DESC`;

        const orders = await query(sql, params) as any[];

        // For each order, fetch items (simplistic N+1 for now, or could use JSON_AGG if mysql 8 supported it well or just a join)
        // With small volume, a loop is fine.
        for (const order of orders) {
            const items = await query(`
                SELECT si.quantity, si.line_total, p.name as product_name, si.variant_options
                FROM sales_items si
                LEFT JOIN products p ON si.product_id = p.id
                WHERE si.order_id = ?
            `, [order.id]) as any[];
            order.items = items;
        }

        return orders;
    } catch (err) {
        console.error("Get Online Orders Error:", err);
        return [];
    }
}

export async function updateOrderStatus(orderId: string, status: string) {
    try {
        await query(`
            UPDATE sales_orders
            SET delivery_status = ?
            WHERE id = ?
        `, [status, orderId]);

        const { revalidatePath } = await import('next/cache');
        revalidatePath('/paths/admin/orders');

        return { success: true };
    } catch (err) {
        console.error("Update Order Status Error:", err);
        return { success: false, error: "Failed to update status" };
    }
}
