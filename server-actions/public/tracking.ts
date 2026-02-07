"use server";

import { query } from "@/lib/db";

export async function trackTicket(ticketNumber: string, phone: string) {
    // 1. Sanitize Inputs
    const cleanPhone = phone.replace(/\D/g, ''); // Remove non-digits? Or keep rudimentary matching

    // 2. Find Ticket
    // We match last 4 digits of phone for privacy/ease, or full phone?
    // Let's require at least last 4 chars match to verify ownership
    const [ticket] = await query(`
        SELECT id, ticket_number, customer_name, device_model, status, created_at, estimated_cost
        FROM tickets 
        WHERE ticket_number = ? AND (customer_phone LIKE ? OR customer_phone = ?)
    `, [ticketNumber, `%${phone}`, phone]) as any[];

    if (!ticket) {
        return { success: false, message: "Ticket not found or phone number mismatch." };
    }

    // 3. Get History
    const history = await query(`
        SELECT action_type, description, created_at 
        FROM ticket_history 
        WHERE ticket_id = ? 
        ORDER BY created_at DESC
    `, [ticket.id]) as any[];

    return { success: true, ticket, history };
}

export async function trackOrder(orderNumber: string, contact: string) {
    // 1. Find Order
    // Match order_number and (email OR phone)
    const [order] = await query(`
        SELECT id, order_number, customer_name, delivery_status, total_amount, created_at, shipping_address
        FROM sales_orders
        WHERE order_number = ? AND (customer_email = ? OR customer_phone LIKE ? OR customer_phone = ?)
    `, [orderNumber, contact, `%${contact}`, contact]) as any[];

    if (!order) {
        return { success: false, message: "Order not found or contact details mismatch." };
    }

    // 2. Get Items
    const rows = await query(`
        SELECT si.quantity, p.name, p.image, p.gallery
        FROM sales_items si
        LEFT JOIN products p ON si.product_id = p.id
        WHERE si.order_id = ?
    `, [order.id]) as any[];

    const items = rows.map(r => {
        const gallery = typeof r.gallery === 'string' ? JSON.parse(r.gallery) : r.gallery;
        const mainImage = (Array.isArray(gallery) && gallery.length > 0) ? gallery[0] : r.image;
        return {
            quantity: r.quantity,
            name: r.name,
            image: mainImage
        };
    });

    return { success: true, order, items };
}
