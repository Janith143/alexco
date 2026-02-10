import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // Mask password in connection string
        const dbUrl = process.env.DATABASE_URL || 'NOT_SET';
        const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':***@');

        // Execute a query to see current DB
        const [rows] = await query('SELECT DATABASE() as db_name, VERSION() as version') as any[];

        return NextResponse.json({
            config: {
                DATABASE_URL: maskedUrl,
                NODE_ENV: process.env.NODE_ENV,
            },
            database_query: rows ? rows[0] : 'No result',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
