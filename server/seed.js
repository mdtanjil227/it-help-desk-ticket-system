const pool = require("./db");
const bcrypt = require("bcrypt");

async function seedDatabase() {
  try {

    // demo user
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      ["demo@test.com"]
    );

    let userId;

    if (existingUser.rows.length > 0) {
      console.log("Demo user already exists");
      userId = existingUser.rows[0].id;
    } else {

      const passwordHash = await bcrypt.hash("123456", 10);

      const user = await pool.query(
        `INSERT INTO users (name, email, password)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ["Demo User", "demo@test.com", passwordHash]
      );

      userId = user.rows[0].id;
      console.log("Demo user created");
    }

    // admin user
    const adminCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      ["admin@test.com"]
    );

    if (adminCheck.rows.length === 0) {

      const adminPassword = await bcrypt.hash("admin123", 10);

      await pool.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)`,
        ["Admin User", "admin@test.com", adminPassword, "admin"]
      );

      console.log("Admin user created");

    } else {

      console.log("Admin already exists");

    }

    // demo tickets
    await pool.query(
      `INSERT INTO tickets (title, description, priority, user_id)
       VALUES
       ('Printer not working', 'Printer on floor 2 is jammed', 'High', $1),
       ('Internet slow', 'Connection dropping frequently', 'Medium', $1),
       ('Software install', 'Need Adobe installed', 'Low', $1)`,
      [userId]
    );

    console.log("Seed data inserted");

    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedDatabase();