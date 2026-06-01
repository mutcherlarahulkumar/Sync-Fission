import express from "express";
import zod from "zod";
import { getClient } from "../../db.js";
import jwt from "jsonwebtoken";

export const router = express.Router();

const signupBody = zod.object({
    firstname: zod.string().min(1),
    lastname: zod.string().min(1),
    email: zod.string().email(),
    password: zod.string().min(6),
});

router.post("/tutor", async (req, res) => {
    const client = await getClient();
    const { success } = signupBody.safeParse(req.body);
    if (!success) {
        return res.status(400).json({ error: "Invalid request body" });
    }
    const { firstname, lastname, email, password } = req.body;
    try {
        const result = await client.query(`
            INSERT INTO tutor(first_name, last_name, email, password)
            VALUES($1, $2, $3, $4)
            RETURNING *;
        `, [firstname, lastname, email, password]);
        const tutor_id = result.rows[0].id;
        const token = jwt.sign({ id: tutor_id }, process.env.JWT_SECRET);
        res.status(201).json({ message: "Tutor created", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error / User already exists" });
    }
});

router.post("/student", async (req, res) => {
    const client = await getClient();
    const { success } = signupBody.safeParse(req.body);
    if (!success) {
        return res.status(400).json({ error: "Invalid request body" });
    }
    const { firstname, lastname, email, password } = req.body;
    try {
        const result = await client.query(`
            INSERT INTO student(first_name, last_name, email, password)
            VALUES($1, $2, $3, $4)
            RETURNING *;
        `, [firstname, lastname, email, password]);
        const student_id = result.rows[0].id;
        const token = jwt.sign({ id: student_id }, process.env.JWT_SECRET);
        res.status(201).json({ message: "Student created", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error / User already exists" });
    }
});
