"use server";

import { query } from "@/lib/db";
import {
    hashPassword,
    getCurrentUser
} from "@/lib/auth";
import { UserRole } from "@/lib/auth-types";

// Create new user (Super User / Admin only)
export async function createUser(formData: FormData): Promise<{ error?: string; success?: boolean }> {
    const currentUser = await getCurrentUser();

    if (!currentUser || (currentUser.role !== 'super_user' && currentUser.role !== 'admin')) {
        return { error: 'Unauthorized. Only Super User or Admin can create users.' };
    }

    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as UserRole;

    if (!username || !password || !fullName || !role) {
        return { error: 'All required fields must be filled' };
    }

    if (password.length < 6) {
        return { error: 'Password must be at least 6 characters' };
    }

    // Check if username exists
    const existing = await query(
        `SELECT id FROM users WHERE username = ?`,
        [username]
    ) as any[];

    if (existing.length > 0) {
        return { error: 'Username already exists' };
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    await query(
        `INSERT INTO users (id, username, password_hash, full_name, email, role, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, username, passwordHash, fullName, email || null, role, currentUser.id]
    );

    return { success: true };
}

// Update user (Super User / Admin only)
export async function updateUser(
    userId: string,
    data: { fullName?: string; email?: string; role?: UserRole; isActive?: boolean }
): Promise<{ error?: string; success?: boolean }> {
    const currentUser = await getCurrentUser();

    if (!currentUser || (currentUser.role !== 'super_user' && currentUser.role !== 'admin')) {
        return { error: 'Unauthorized' };
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (data.fullName) {
        updates.push('full_name = ?');
        values.push(data.fullName);
    }
    if (data.email !== undefined) {
        updates.push('email = ?');
        values.push(data.email || null);
    }
    if (data.role) {
        updates.push('role = ?');
        values.push(data.role);
    }
    if (data.isActive !== undefined) {
        updates.push('is_active = ?');
        values.push(data.isActive);
    }

    if (updates.length === 0) {
        return { error: 'No fields to update' };
    }

    values.push(userId);
    await query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
    );

    return { success: true };
}

// Reset password (Super User / Admin only)
export async function resetPassword(userId: string, newPassword: string): Promise<{ error?: string; success?: boolean }> {
    const currentUser = await getCurrentUser();

    if (!currentUser || (currentUser.role !== 'super_user' && currentUser.role !== 'admin')) {
        return { error: 'Unauthorized' };
    }

    if (newPassword.length < 6) {
        return { error: 'Password must be at least 6 characters' };
    }

    const passwordHash = await hashPassword(newPassword);
    await query(
        `UPDATE users SET password_hash = ? WHERE id = ?`,
        [passwordHash, userId]
    );

    return { success: true };
}

// Get all users (for management UI)
export async function getAllUsers(): Promise<any[]> {
    const currentUser = await getCurrentUser();

    if (!currentUser || (currentUser.role !== 'super_user' && currentUser.role !== 'admin')) {
        return [];
    }

    const rows = await query(
        `SELECT id, username, full_name, email, role, is_active, created_at, last_login 
         FROM users ORDER BY created_at DESC`
    ) as any[];

    return rows;
}
