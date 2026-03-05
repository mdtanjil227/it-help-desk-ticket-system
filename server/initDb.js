const pool = require("./db")

const createTables = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
            `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS tickets (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'Open',
            priority VARCHAR(50) DEFAULT 'Medium',
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            assigned_to INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
    `   );

        await pool.query(`
            CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
`       );


    console.log("Tables created successfully");
    process.exit();

    } catch (err) {
        console.error("Error creating tables", err);
        process.exit(1);
    }
};

createTables();