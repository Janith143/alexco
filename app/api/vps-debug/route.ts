import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // Mask password in connection string
        const dbUrl = process.env.DATABASE_URL || 'NOT_SET';
        const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':***@');

        // Execute a query to see current DB
        const result = await query('SELECT DATABASE() as db_name, VERSION() as version') as any[];
        // result is [Row1, Row2] or just Row1? query() in lib/db.ts returns rows.
        // If it returns [RowDataPacket], then result[0] is the first row.

        return NextResponse.json({
            config: {
                DATABASE_URL: maskedUrl,
                NODE_ENV: process.env.NODE_ENV,
                CWD: process.cwd(), // Log current working directory
            },
            database_query: Array.isArray(result) ? result[0] : result,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
