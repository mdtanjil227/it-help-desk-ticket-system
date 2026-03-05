const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
require("dotenv").config();
const pool = require("./db");

const app = express();

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());
/* API Documentation */
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IT Help Desk API",
      version: "1.0.0",
      description: "API documentation for the IT Help Desk Ticket System"
    },
    servers: [
      {
        url: "http://localhost:5000"
      }
    ]
  },
  apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ROUTES */
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const ticketRoutes = require("./routes/tickets");
app.use("/api/tickets", ticketRoutes);

const authMiddleware = require("./middleware/authMiddleware");

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed a protected route",
    user: req.user
  });
});

/* TEST ROUTE */
app.get("/", (req, res) => {
  res.send("IT Helpdesk API Running...");
});

pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("DB connection error", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});