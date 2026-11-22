// ===============================
// Student Dashboard Backend
// Express + PostgreSQL (cloud-hosted: Supabase / Railway / Render / etc.)
// ===============================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*" }));
app.use(express.json());

// ---------------------------------------
// PostgreSQL connection pool
// Cloud providers (Supabase/Railway/Render) need SSL.
// Local PostgreSQL (on your own PC) does NOT need SSL,
// so we auto-detect based on the connection string.
// ---------------------------------------
const isLocalDb =
    (process.env.DATABASE_URL || "").includes("localhost") ||
    (process.env.DATABASE_URL || "").includes("127.0.0.1");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocalDb ? false : { rejectUnauthorized: false }
});

pool.connect()
    .then(function (client) {
        client.release();
        console.log("Connected to PostgreSQL successfully.");
    })
    .catch(function (err) {
        console.error("Failed to connect to PostgreSQL:", err.message);
    });

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing. Copy .env.example to .env and set it.");
    process.exit(1);
}

// ---------------------------------------
// Helpers
// ---------------------------------------
function parseStudent(body) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const course = typeof body.course === "string" ? body.course.trim() : "";
    const age = Number(body.age);

    if (!name || !course || !Number.isInteger(age) || age < 1 || age > 120) {
        return null;
    }
    return { name, age, course };
}

function isValidId(id) {
    return /^\d+$/.test(id);
}

// ---------------------------------------
// Routes
// ---------------------------------------

// Health check
app.get("/", function (req, res) {
    res.send("Student Dashboard API is running.");
});

// GET all students
app.get("/api/students", async function (req, res) {
    try {
        const result = await pool.query(
            "SELECT * FROM students ORDER BY id ASC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch students." });
    }
});

// POST a new student
app.post("/api/students", async function (req, res) {
    const student = parseStudent(req.body);

    if (!student) {
        return res.status(400).json({ error: "name, course and a valid age (1-120) are required." });
    }
    const { name, age, course } = student;

    try {
        const result = await pool.query(
            "INSERT INTO students (name, age, course) VALUES ($1, $2, $3) RETURNING *",
            [name, age, course]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add student." });
    }
});

// PUT (update) a student by id
app.put("/api/students/:id", async function (req, res) {
    const { id } = req.params;
    const student = parseStudent(req.body);

    if (!isValidId(id)) {
        return res.status(400).json({ error: "Invalid student id." });
    }
    if (!student) {
        return res.status(400).json({ error: "name, course and a valid age (1-120) are required." });
    }
    const { name, age, course } = student;

    try {
        const result = await pool.query(
            "UPDATE students SET name = $1, age = $2, course = $3 WHERE id = $4 RETURNING *",
            [name, age, course, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Student not found." });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update student." });
    }
});

// DELETE a student by id
app.delete("/api/students/:id", async function (req, res) {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({ error: "Invalid student id." });
    }

    try {
        const result = await pool.query(
            "DELETE FROM students WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Student not found." });
        }

        res.json({ message: "Student deleted.", student: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete student." });
    }
});

app.listen(PORT, function () {
    console.log(`Server running on http://localhost:${PORT}`);
});