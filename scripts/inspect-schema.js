const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL not found in .env.local");
        process.exit(1);
    }

    const connection = await mysql.createConnection(connectionString);

    console.log("--- Products Table ---");
    try {
        const [products] = await connection.query("DESCRIBE products");
        console.log(products.map(c => c.Field).join(", "));
    } catch (e) {
        console.log("products table not found or error:", e.message);
    }

    console.log("\n--- Tables List ---");
    const [tables] = await connection.query("SHOW TABLES");
    console.log(tables.map(t => Object.values(t)[0]).join(", "));

    await connection.end();
}

main().catch(console.error);
