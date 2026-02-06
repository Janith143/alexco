import mysql from 'mysql2/promise';

// Extract connection params if needed, or pass the connection string directly
// DATABASE_URL format: mysql://user:password@host:port/database
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
}

export const pool = mysql.createPool(connectionString);

export const query = async (sql: string, params?: any[]) => {
    const [rows, fields] = await pool.execute(sql, params);
    return rows;
};

export const getClient = async () => {
    return await pool.getConnection(); // Returns a connection from the pool
};
