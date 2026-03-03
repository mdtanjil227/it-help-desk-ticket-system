const pool = require("./db");

pool.connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch(err => console.error("DB connection error", err));

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);



app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("IT Helpdesk API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen (PORT, () => {
    console.log(`Server running on port ${PORT}`);
});