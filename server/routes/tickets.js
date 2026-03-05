const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    const newTicket = await pool.query(
      `INSERT INTO tickets (title, description, priority, user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description, priority, req.user.userId]
    );

    res.status(201).json(newTicket.rows[0]);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {

    const tickets = await pool.query(
      `SELECT * FROM tickets
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.userId]
    );

    res.json(tickets.rows);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;