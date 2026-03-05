const { body, validationResult } = require("express-validator");
const adminMiddleware = require("../middleware/adminMiddleware");
const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

/*Create Ticket*/
router.post(
  "/",
  authMiddleware,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("priority")
      .isIn(["Low", "Medium", "High"])
      .withMessage("Priority must be Low, Medium, or High"),
  ],
  async (req, res) => {
    try {

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

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
  }
);

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

/*Update Ticket*/
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const ticketId = req.params.id;

    const updatedTicket = await pool.query(
      `UPDATE tickets
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, ticketId]
    );

    res.json(updatedTicket.rows[0]);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/*Assign Tech*/
router.patch("/:id/assign", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { technician_id } = req.body;
    const ticketId = req.params.id;

    const updatedTicket = await pool.query(
      `UPDATE tickets
       SET assigned_to = $1
       WHERE id = $2
       RETURNING *`,
      [technician_id, ticketId]
    );

    res.json(updatedTicket.rows[0]);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/*All Tickets, Admin*/
router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {

    const tickets = await pool.query(
      `SELECT tickets.*, users.name AS created_by
       FROM tickets
       JOIN users ON tickets.user_id = users.id
       ORDER BY tickets.created_at DESC`
    );

    res.json(tickets.rows);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/*Post Comments*/
router.post("/:id/comments", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const ticketId = req.params.id;

    const newComment = await pool.query(
      `INSERT INTO comments (ticket_id, user_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [ticketId, req.user.userId, message]
    );

    res.status(201).json(newComment.rows[0]);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/*Post Comments*/
router.get("/:id/comments", authMiddleware, async (req, res) => {
  try {
    const ticketId = req.params.id;

    const comments = await pool.query(
      `SELECT comments.*, users.name AS author
       FROM comments
       JOIN users ON comments.user_id = users.id
       WHERE ticket_id = $1
       ORDER BY created_at ASC`,
      [ticketId]
    );

    res.json(comments.rows);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;