import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getClient } from "../../db.js";
import zod from "zod";

const signinBody = zod.object({
    email: zod.string().email(),
    password: zod.string().min(6),
});

export const router = express.Router();

// Early rows in this project stored passwords in plain text. Rather than lock
// those accounts out, a plaintext match is accepted once and the row is
// immediately rewritten with a bcrypt hash. Delete this branch once the logs
// show no more upgrades happening.
async function verify(client, table, row, password) {
    if (row.password.startsWith("$2")) {
        return bcrypt.compare(password, row.password);
    }
    if (row.password !== password) return false;

    const hash = await bcrypt.hash(password, 10);
    await client.query(`UPDATE ${table} SET password = $1 WHERE id = $2`, [hash, row.id]);
    console.log(`Upgraded legacy password for ${table} ${row.id}`);
    return true;
}

async function signIn(req, res, table, role) {
    const client = await getClient();
    const { success } = signinBody.safeParse(req.body);
    if (!success) {
        return res.status(400).json({ error: "Invalid request body" });
    }

    const { email, password } = req.body;
    try {
        const result = await client.query(
            `SELECT id, password FROM ${table} WHERE email = $1;`,
            [email],
        );
        // One response for both "no such account" and "wrong password" so the
        // endpoint can't be used to find out who is registered.
        if (result.rows.length === 0 || !(await verify(client, table, result.rows[0], password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: result.rows[0].id, role }, process.env.JWT_SECRET);
        res.status(200).json({ message: `${role === "tutor" ? "Tutor" : "Student"} signed in`, token, role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

router.post("/tutor", (req, res) => signIn(req, res, "tutor", "tutor"));
router.post("/student", (req, res) => signIn(req, res, "student", "student"));
