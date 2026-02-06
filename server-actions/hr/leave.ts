"use server";

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function submitLeaveRequest(data: any) {
    const { employee_id, leave_type_id, start_date, end_date, days_requested, reason } = data;
    const id = crypto.randomUUID();

    await query(`
        INSERT INTO leave_requests (id, employee_id, leave_type_id, start_date, end_date, days_requested, reason, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [id, employee_id, leave_type_id, start_date, end_date, days_requested, reason]);

    revalidatePath('/paths/HR/leave');
    return { success: true };
}

export async function getLeaveBalances(employeeId: string, year: number) {
    const rows = await query(`
        SELECT lt.id as type_id, lt.name, lt.code, 
               COALESCE(lb.entitled_days, 14) as entitled_days, 
               COALESCE(lb.taken_days, 0) as taken_days, 
               COALESCE(lb.pending_days, 0) as pending_days 
        FROM leave_types lt
        LEFT JOIN leave_balances lb ON lb.leave_type_id = lt.id AND lb.employee_id = ? AND lb.year = ?
    `, [employeeId, year]);
    return rows as any[];
}

export async function getPendingRequests() {
    // For managers/admin to approve
    const rows = await query(`
        SELECT lr.*, e.full_name as employee_name, lt.name as leave_type
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        JOIN leave_types lt ON lr.leave_type_id = lt.id
        WHERE lr.status = 'pending'
        ORDER BY lr.created_at ASC
    `);
    return rows as any[];
}

export async function updateLeaveStatus(requestId: string, status: 'approved' | 'rejected', approverId: string) {
    // 1. Update request status
    await query(`
        UPDATE leave_requests 
        SET status = ?, approved_by = ?, approved_at = NOW() 
        WHERE id = ?
    `, [status, approverId, requestId]);

    if (status === 'approved') {
        // 2. Fetch request details to update balance
        const [request] = await query(`SELECT * FROM leave_requests WHERE id = ?`, [requestId]) as any[];

        if (request) {
            const year = new Date(request.start_date).getFullYear();

            // 3. Update or Insert Balance record
            // This simplistically assumes balance row exists. In production, use INSERT ... ON DUPLICATE KEY UPDATE
            // For now, let's just increment taken_days
            await query(`
                INSERT INTO leave_balances (id, employee_id, leave_type_id, year, entitled_days, taken_days)
                VALUES (UUID(), ?, ?, ?, 14, ?)
                ON DUPLICATE KEY UPDATE taken_days = taken_days + ?
            `, [request.employee_id, request.leave_type_id, year, request.days_requested, request.days_requested]);
        }
    }

    revalidatePath('/paths/HR/leave');
    return { success: true };
}

export async function getLeaveTypes() {
    const rows = await query("SELECT * FROM leave_types");
    return rows as any[];
}

export async function getAllLeaveRequests() {
    const rows = await query(`
        SELECT lr.*, e.full_name as employee_name, lt.name as leave_type
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        JOIN leave_types lt ON lr.leave_type_id = lt.id
        ORDER BY lr.created_at DESC
    `);
    return rows as any[];
}

// Get employee leave history (Moved from hr-employees.ts)
export async function getEmployeeLeaveHistory(employeeId: string) {
    const rows = await query(`
        SELECT lr.*, lt.name as leave_type_name
        FROM leave_requests lr
        JOIN leave_types lt ON lr.leave_type_id = lt.id
        WHERE lr.employee_id = ?
        ORDER BY lr.created_at DESC
    `, [employeeId]) as any[];
    return rows;
}
