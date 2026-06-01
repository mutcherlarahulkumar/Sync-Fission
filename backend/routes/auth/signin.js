import express from "express";
import jwt from "jsonwebtoken";
import { getClient } from "../../db.js";
import zod from "zod";

const signinBody = zod.object({
    email: zod.string().email(),
    password: zod.string().min(6),
});

export const router = express.Router();

router.post("/tutor", async (req, res) => {
    const client = await getClient();
    const { success } = signinBody.safeParse(req.body);
    if (!success) {
        return res.status(400).json({ error: "Invalid request body" });
    }
    const { email, password } = req.body;
    try {
        const result = await client.query(`
            SELECT * FROM tutor WHERE email = $1 AND password = $2;
        `, [email, password]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const tutor_id = result.rows[0].id;
        const token = jwt.sign({ id: tutor_id }, process.env.JWT_SECRET);
        res.status(200).json({ message: "Tutor signed in", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/student", async (req, res) => {
    const client = await getClient();
    const { success } = signinBody.safeParse(req.body);
    if (!success) {
        return res.status(400).json({ error: "Invalid request body" });
    }
    const { email, password } = req.body;
    try {
        const result = await client.query(`
            SELECT * FROM student WHERE email = $1 AND password = $2;
        `, [email, password]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const student_id = result.rows[0].id;
        const token = jwt.sign({ id: student_id }, process.env.JWT_SECRET);
        res.status(200).json({ message: "Student signed in", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
