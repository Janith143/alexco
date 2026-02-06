"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllUsers, createUser, updateUser, resetPassword } from "@/server-actions/auth/user-management";
import { ROLE_LABELS, UserRole } from "@/lib/auth-types";
import { Plus, RefreshCw, Shield, UserCheck, UserX } from "lucide-react";
import Link from "next/link";

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [createSuccess, setCreateSuccess] = useState(false);

    async function loadUsers() {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setLoading(false);
    }

    useEffect(() => {
        loadUsers();
    }, []);

    async function handleCreateUser(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setCreateError(null);
        setCreateSuccess(false);

        const formData = new FormData(e.currentTarget);
        const result = await createUser(formData);

        if (result.error) {
            setCreateError(result.error);
        } else {
            setCreateSuccess(true);
            setShowCreateForm(false);
            loadUsers();
            (e.target as HTMLFormElement).reset();
        }
    }

    async function toggleUserStatus(userId: string, currentStatus: boolean) {
        await updateUser(userId, { isActive: !currentStatus });
        loadUsers();
    }

    async function handleResetPassword(userId: string) {
        const newPassword = prompt('Enter new password (min 6 characters):');
        if (newPassword && newPassword.length >= 6) {
            const result = await resetPassword(userId, newPassword);
            if (result.success) {
                alert('Password reset successfully');
            } else {
                alert(result.error || 'Failed to reset password');
            }
        }
    }

    /* const roles: UserRole[] = [
        'super_user', 'admin', 'manager', 'cashier', 'technician',
        'hr_staff', 'accountant', 'ecommerce_admin', 'repair_admin'
    ]; */ // Legacy hardcoded roles

    const [availableRoles, setAvailableRoles] = useState<{ slug: string, name: string }[]>([]);

    useEffect(() => {
        async function fetchRoles() {
            // We can import getRoles from server-actions/roles but it's a server action. 
            // Better to wrap it or call it directly if fine.
            // Let's assume we can call getRoles() directly here as it is "use server"
            const { getRoles } = await import("@/server-actions/roles");
            const rolesData = await getRoles();
            setAvailableRoles(rolesData.map(r => ({ slug: r.slug, name: r.name })));
        }
        fetchRoles();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadUsers}>
                        <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                    </Button>
                    <Link href="/paths/admin/users/roles">
                        <Button variant="outline">
                            <Shield className="h-4 w-4 mr-2" /> Manage Roles
                        </Button>
                    </Link>
                    <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                        <Plus className="h-4 w-4 mr-2" /> Create User
                    </Button>
                </div>
            </div>

            {/* Create User Form */}
            {showCreateForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create New User</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {createError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                {createError}
                            </div>
                        )}
                        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Username *</label>
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="e.g. john.doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    minLength={6}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Min 6 characters"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="e.g. john@alexco.lk"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
                                <select name="role" required className="w-full px-3 py-2 border rounded-lg">
                                    <option value="">Select Role</option>
                                    {availableRoles.map(role => (
                                        <option key={role.slug} value={role.slug}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" className="w-full">
                                    Create User
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {createSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    User created successfully!
                </div>
            )}

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Users ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-slate-400">Loading users...</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            No users found. Create the first Super User.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">User</th>
                                        <th className="px-4 py-3 text-left">Role</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Last Login</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">{user.full_name}</div>
                                                <div className="text-xs text-slate-400">@{user.username}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                                    <Shield className="h-3 w-3" />
                                                    {ROLE_LABELS[user.role as UserRole] || user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.is_active ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                                                        <UserCheck className="h-3 w-3" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-500 text-xs">
                                                        <UserX className="h-3 w-3" /> Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-xs">
                                                {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleResetPassword(user.id)}
                                                    >
                                                        Reset Password
                                                    </Button>
                                                    <Button
                                                        variant={user.is_active ? "destructive" : "default"}
                                                        size="sm"
                                                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                                                    >
                                                        {user.is_active ? 'Deactivate' : 'Activate'}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
