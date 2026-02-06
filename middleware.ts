import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'alexco-secret-key-change-in-production'
);

// Routes that require authentication
const PROTECTED_ROUTES = ['/paths'];

// Route access by role
const ROUTE_PERMISSIONS: Record<string, string[]> = {
    '/paths/POS': ['super_user', 'admin', 'manager', 'cashier'],
    '/paths/Ticket': ['super_user', 'admin', 'manager', 'technician', 'repair_admin'],
    '/paths/admin/inventory': ['super_user', 'admin', 'manager', 'technician', 'accountant', 'ecommerce_admin', 'repair_admin'],
    '/paths/HR': ['super_user', 'admin', 'manager', 'hr_staff', 'accountant'],
    '/paths/admin/users': ['super_user', 'admin'],
    '/paths/admin': ['super_user', 'admin', 'manager', 'accountant'],
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if route needs protection
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    // Get token from cookie
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        // Redirect to login
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        // Verify token using jose (Edge-compatible)
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userRole = payload.role as string;

        // Check route-specific permissions
        for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
            if (pathname.startsWith(route)) {
                if (!allowedRoles.includes(userRole)) {
                    // Redirect to dashboard with no access
                    return NextResponse.redirect(new URL('/paths/admin?error=no_access', request.url));
                }
                break;
            }
        }

        // Add user info to request headers for downstream use
        const response = NextResponse.next();
        response.headers.set('x-user-id', payload.userId as string);
        response.headers.set('x-user-role', userRole);
        return response;

    } catch (error) {
        // Invalid token - redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
    }
}

export const config = {
    matcher: ['/paths/:path*'],
};
