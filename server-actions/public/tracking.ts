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
