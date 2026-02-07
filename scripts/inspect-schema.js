const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL not found in .env.local");
        process.exit(1);
    }

    try {
        const connection = await mysql.createConnection(connectionString);

        const [columns] = await connection.query("DESCRIBE products");

        console.log(JSON.stringify(columns, null, 2));

        await connection.end();
    } catch (e) {
        console.error("Error inspecting schema:", e);
    }
}

main();
