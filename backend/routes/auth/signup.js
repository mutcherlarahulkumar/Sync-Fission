import express from "express";
import zod from "zod";
import bcrypt from "bcryptjs";
import { getClient } from "../../db.js";
import jwt from "jsonwebtoken";

export const router = express.Router();

const signupBody = zod.object({
    firstname: zod.string().min(1),
    lastname: zod.string().min(1),
    email: zod.string().email(),
    password: zod.string().min(6),
});

// The role is baked into the token so downstream code (and the AI assistant in
// particular) can tell a tutor from a student. Tutor and student ids come from
// two separate sequences, so the id alone is ambiguous.
async function register(req, res, table, role) {
    const client = await getClient();
    const { success } = signupBody.safeParse(req.body);
    if (!success) {
        return res.status(400).json({ error: "Invalid request body" });
    }

    const { firstname, lastname, email, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const result = await client.query(
            `INSERT INTO ${table}(first_name, last_name, email, password)
             VALUES($1, $2, $3, $4)
             RETURNING id;`,
            [firstname, lastname, email, hash],
        );
        const id = result.rows[0].id;
        const token = jwt.sign({ id, role }, process.env.JWT_SECRET);
        res.status(201).json({ message: `${role === "tutor" ? "Tutor" : "Student"} created`, token, role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error / User already exists" });
    }
}

router.post("/tutor", (req, res) => register(req, res, "tutor", "tutor"));
router.post("/student", (req, res) => register(req, res, "student", "student"));
