"use server";

import { query } from "@/lib/db";
import {
    verifyPassword,
    createSession,
    destroySession,
    getCurrentUser,
    User
} from "@/lib/auth";
import { UserRole } from "@/lib/auth-types";
import { redirect } from "next/navigation";

// Login action
export async function login(formData: FormData): Promise<{ error?: string; success?: boolean; role?: UserRole }> {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
        return { error: 'Username and password are required' };
    }

    // Find user
    const rows = await query(
        `SELECT id, username, password_hash, full_name, email, role, is_active 
         FROM users WHERE username = ?`,
        [username]
    ) as any[];

    const user = rows[0];

    if (!user) {
        return { error: 'Invalid username or password' };
    }

    if (!user.is_active) {
        return { error: 'Account is deactivated. Contact administrator.' };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
        return { error: 'Invalid username or password' };
    }

    // Create session
    await createSession({
        id: user.id,
        username: user.username,
        role: user.role
    });

    return { success: true, role: user.role };
}

// Logout action
export async function logout(): Promise<void> {
    await destroySession();
    redirect('/login');
}

// Get current session user
export async function getSessionUser(): Promise<User | null> {
    return getCurrentUser();
}
