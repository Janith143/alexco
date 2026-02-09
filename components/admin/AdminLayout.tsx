"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, AlertTriangle, Ticket, Users, Store, LogOut, Shield, CreditCard, FileText, Calendar, ShoppingBag, Settings, Folder, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getSessionUser, logout } from "@/server-actions/auth";
import { ROLE_LABELS, UserRole } from "@/lib/auth-types";

interface AdminLayoutProps {
    children: React.ReactNode;
}

interface CurrentUser {
    id: string;
    username: string;
    full_name: string;
    role: UserRole;
    permissions: string[];
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<CurrentUser | null>(null);

    useEffect(() => {
        async function loadUser() {
            const sessionUser = await getSessionUser();
            setUser(sessionUser as CurrentUser);
        }
        loadUser();
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    // Base nav items available to most roles
    const allNavItems = [
        { href: "/paths/my-portal", label: "My Portal", icon: LayoutDashboard, roles: [] }, // Access controlled by filtering below
        { href: "/paths/admin", label: "Dashboard", icon: LayoutDashboard, roles: ['super_user', 'admin', 'manager', 'accountant'] },
        { href: "/paths/POS", label: "POS Terminal", icon: CreditCard, roles: ['super_user', 'admin', 'manager', 'cashier'] },
        { href: "/paths/admin/inventory", label: "Inventory", icon: AlertTriangle, roles: ['super_user', 'admin', 'manager', 'technician', 'accountant', 'ecommerce_admin', 'repair_admin'] },
        { href: "/paths/admin/orders", label: "Online Orders", icon: ShoppingBag, roles: ['super_user', 'admin', 'manager', 'accountant', 'ecommerce_admin'] },
        { href: "/paths/admin/messages", label: "Messages", icon: MessageSquare, roles: ['super_user', 'admin', 'manager', 'ecommerce_admin'] },
        { href: "/paths/Ticket", label: "Job Tickets", icon: Ticket, roles: ['super_user', 'admin', 'manager', 'technician', 'repair_admin'] },

        // HR Section
        { href: "/paths/HR", label: "HR Dashboard", icon: Users, roles: ['super_user', 'admin', 'manager', 'hr_staff', 'accountant'] },
        { href: "/paths/HR/employees", label: "Employees", icon: Users, roles: ['super_user', 'admin', 'manager', 'hr_staff'] },
        { href: "/paths/HR/leave", label: "Leave Management", icon: Calendar, roles: ['super_user', 'admin', 'manager', 'hr_staff'] },
        { href: "/paths/HR/reports", label: "Payroll", icon: FileText, roles: ['super_user', 'admin', 'hr_staff', 'accountant'] },

        { href: "/paths/admin/reports", label: "Reports Hub", icon: FileText, roles: ['super_user', 'admin', 'manager', 'accountant'] },

        { href: "/paths/admin/settings/delivery", label: "Settings", icon: Settings, roles: ['super_user', 'admin'] },
        { href: "/paths/admin/categories", label: "Categories", icon: Folder, roles: ['super_user', 'admin', 'manager'] },

        { href: "/paths/admin/users", label: "User Management", icon: Shield, roles: ['super_user', 'admin'] },
        { href: "/paths/admin/users/roles", label: "Roles", icon: Shield, roles: ['super_user', 'admin'] },
    ];

    // Filter nav items based on user permissions
    const navItems = user
        ? allNavItems.filter(item => {
            // If item has roles array, check if user has matching permission logic
            // Mapping old role-based logic to new permission-based logic
            // ideally we update the items definition to use permission codes directly

            // Mapping sidebar items to granular permissions
            if (item.label === 'My Portal') return true; // Available to all authenticated users
            if (item.label === 'Dashboard') return user.permissions.includes('admin.view');
            if (item.label === 'POS Terminal') return user.permissions.includes('pos.access');
            if (item.href === '/paths/Ticket') return user.permissions.includes('tickets.manage');
            if (item.label === 'Inventory') return user.permissions.includes('inventory.view');
            if (item.label === 'Online Orders') return user.permissions.includes('ecommerce.manage');
            if (item.label === 'Messages') return user.permissions.includes('ecommerce.manage') || user.permissions.includes('admin.view');

            // Granular HR/Payroll permissions
            if (item.label === 'HR Dashboard') return user.permissions.includes('hr.view');
            if (item.label === 'Employees') return user.permissions.includes('hr.view') || user.permissions.includes('hr.manage');
            if (item.label === 'Leave Management') return user.permissions.includes('hr.view');
            if (item.label === 'Payroll') return user.permissions.includes('payroll.view') || user.permissions.includes('payroll.manage');

            // Granular Admin permissions
            if (item.label === 'Reports Hub') return user.permissions.includes('reports.view') || user.permissions.includes('admin.view');
            if (item.label === 'Settings') return user.permissions.includes('admin.settings') || user.permissions.includes('admin.manage');
            if (item.label === 'User Management') return user.permissions.includes('users.manage');
            if (item.label === 'Roles') return user.permissions.includes('users.manage');
            if (item.label === 'Categories') return user.permissions.includes('inventory.categories') || user.permissions.includes('inventory.manage');

            return false;
        })
        : [];

    return (
        <div className="flex min-h-screen bg-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-slate-800">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-bold text-xl tracking-tight">
                            Alex<span className="text-blue-500">co</span> Admin
                        </span>
                    </Link>
                </div>

                {/* User Info */}
                {user && (
                    <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                        <div className="text-sm font-medium text-white">{user.full_name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">@{user.username}</div>
                        <div className="mt-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded text-xs">
                                <Shield className="h-3 w-3" />
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                )}

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href ||
                            (item.href !== '/paths/admin' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <Link href="/">
                        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 gap-3">
                            <Store className="h-5 w-5" />
                            <span>Visit Store</span>
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-800 gap-3 mt-2"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between">
                    <span className="font-bold">Alexco Admin</span>
                    {user && (
                        <span className="text-xs text-slate-400">{ROLE_LABELS[user.role]}</span>
                    )}
                </div>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
