import express from 'express';
import { authMiddleware } from './auth/authmiddleware.js';
import { getClient } from '../db.js';
import zod from 'zod';
import jwt from 'jsonwebtoken';

export const router = express.Router();
const client = await getClient();

router.get('/', (req, res) => {
    res.send('Tutor API');
});

router.get("/dashboard", authMiddleware, async (req, res) => {
    try {
        const tutor_id = req.id;
        const result = await client.query(`SELECT * FROM tutor WHERE id=$1;`, [tutor_id]);
        res.json({ tutor: result.rows[0], message: "Tutor dashboard" });
    } catch (err) {
        res.status(500).json({ message: "Cannot fetch tutor info" });
    }
});

router.get("/name", authMiddleware, async (req, res) => {
    try {
        const tutor_id = req.id;
        const result = await client.query(`SELECT * FROM tutor WHERE id=$1;`, [tutor_id]);
        res.json({ tutor: result.rows[0], message: "Tutor info" });
    } catch (err) {
        res.status(500).json({ message: "Cannot fetch tutor info" });
    }
});

const createClassSchema = zod.object({
    name: zod.string().min(1),
    description: zod.string(),
    book_ref: zod.string(),
    prereqs: zod.string(),
});

router.post("/createclass", authMiddleware, async (req, res) => {
    try {
        const tutor_id = req.id;
        const parseddata = createClassSchema.safeParse(req.body);
        if (!parseddata.success) {
            return res.status(400).json({ error: "Invalid request body" });
        }
        const { name, description, book_ref, prereqs } = parseddata.data;
        const newClass = await client.query(`
            INSERT INTO class(name, description, book_ref, prereqs, tutor_id)
            VALUES($1, $2, $3, $4, $5) RETURNING *;
        `, [name, description, book_ref, prereqs, tutor_id]);
        res.json({ newClass: newClass.rows[0], message: "Class created successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Cannot create class" });
    }
});

router.get("/classes", authMiddleware, async (req, res) => {
    try {
        const tutor_id = req.id;
        const classes = await client.query(`SELECT * FROM class WHERE tutor_id=$1;`, [tutor_id]);
        res.json({ classes: classes.rows, message: "Classes fetched" });
    } catch (err) {
        res.status(500).json({ message: "Cannot fetch classes" });
    }
});

router.post('/class/students', authMiddleware, async (req, res) => {
    try {
        const { class_id } = req.body;
        const students = await client.query(`
            SELECT student.*
            FROM student
            JOIN class_student ON student.id = class_student.student_id
            WHERE class_student.class_id = $1;
        `, [class_id]);
        res.json({ students: students.rows });
    } catch (err) {
        res.status(500).json({ message: "Cannot fetch students" });
    }
});

router.get("/class/:class_id", authMiddleware, async (req, res) => {
    try {
        const { class_id } = req.params;
        const classInfo = await client.query(`SELECT * FROM class WHERE id=$1;`, [class_id]);
        const classcode = jwt.sign({ code: class_id }, process.env.JWT_SECRET);
        res.json({ classInfo: classInfo.rows[0], classcode, message: "Class info fetched" });
    } catch (err) {
        res.status(500).json({ message: "Cannot fetch class info" });
    }
});

router.post("/class/:class_id/createassignment", authMiddleware, async (req, res) => {
    try {
        const { class_id } = req.params;
        const { title, link, description, due_date } = req.body;
        const newAssignment = await client.query(`
            INSERT INTO assignment(title, link, description, due_date, class_id)
            VALUES($1, $2, $3, $4, $5) RETURNING *;
        `, [title, link, description, due_date, class_id]);
        res.json({ assignment: newAssignment.rows[0], message: "Assignment created successfully" });
    } catch (err) {
        res.status(500).json({ message: "Cannot create assignment" });
    }
});

router.get("/class/:class_id/assignments", authMiddleware, async (req, res) => {
    try {
        const { class_id } = req.params;
        const assignments = await client.query(`SELECT * FROM assignment WHERE class_id=$1;`, [class_id]);
        res.json({ assignments: assignments.rows, message: "Assignments fetched" });
    } catch (err) {
        res.status(500).json({ message: "Cannot fetch assignments" });
    }
});

router.get("/class/:class_id/announcements", authMiddleware, async (req, res) => {
    try {
        const { class_id } = req.params;
        const announcements = await client.query(`SELECT * FROM announcement WHERE class_id=$1;`, [class_id]);
        res.json({ announcements: announcements.rows, message: "Announcements fetched" });
    } catch (err) {
        res.status(500).json({ message: "Cannot fetch announcements" });
    }
});

router.post("/class/:class_id/addannouncement", authMiddleware, async (req, res) => {
    try {
        const { class_id } = req.params;
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required" });
        }
        const newAnnouncement = await client.query(`
            INSERT INTO announcement(title, description, class_id)
            VALUES($1, $2, $3) RETURNING *;
        `, [title, description, class_id]);
        res.json({ newAnnouncement: newAnnouncement.rows[0], message: "Announcement added successfully" });
    } catch (err) {
        res.status(500).json({ message: "Cannot add announcement" });
    }
});

router.post("/class/:class_id/addresource", authMiddleware, async (req, res) => {
    try {
        const { class_id } = req.params;
        const { type, title, link } = req.body;
        const newResource = await client.query(`
            INSERT INTO resource(type, title, link, class_id)
            VALUES($1, $2, $3, $4) RETURNING *;
        `, [type, title, link, class_id]);
        res.json({ newResource: newResource.rows[0], message: "Resource added successfully" });
    } catch (err) {
        res.status(500).json({ message: "Cannot add resource" });
    }
});

router.get("/class/:class_id/resources", authMiddleware, async (req, res) => {
    try {
        const { class_id } = req.params;
        const resources = await client.query(`SELECT * FROM resource WHERE class_id=$1;`, [class_id]);
        res.json({ resources: resources.rows, message: "Resources fetched" });
    } catch (err) {
        res.status(500).json({ message: "Cannot fetch resources" });
    }
});

router.get("/class/:class_id/doubts", authMiddleware, async (req, res) => {
    try {
        const { class_id } = req.params;
        const doubts = await client.query(`SELECT * FROM doubt WHERE class_id=$1;`, [class_id]);
        res.json({ doubts: doubts.rows, message: "Doubts fetched" });
    } catch (err) {
        res.status(500).json({ message: "Cannot fetch doubts" });
    }
});

router.get("/class/:class_id/doubt/:doubt_id", authMiddleware, async (req, res) => {
    try {
        const { doubt_id } = req.params;
        const doubt = await client.query(`SELECT * FROM doubt WHERE id=$1;`, [doubt_id]);
        if (doubt.rows.length === 0) {
            return res.status(404).json({ message: "Doubt not found" });
        }
        const student = await client.query(`SELECT * FROM student WHERE id=$1;`, [doubt.rows[0].student_id]);
        res.json({ doubt: doubt.rows[0], student: student.rows[0], message: "Doubt fetched" });
    } catch (err) {
        res.status(500).json({ message: "Cannot fetch doubt" });
    }
});

router.post("/class/:class_id/doubt/:doubt_id/reply", authMiddleware, async (req, res) => {
    try {
        const { doubt_id } = req.params;
        const { reply } = req.body;
        const doubt_reply = await client.query(`
            INSERT INTO doubt_reply(reply, doubt_id) VALUES($1, $2) RETURNING *;
        `, [reply, doubt_id]);
        res.json({ doubt_reply: doubt_reply.rows[0], message: "Reply posted" });
    } catch (err) {
        res.status(500).json({ message: "Cannot post reply", error: err.message });
    }
});

router.get("/class/:class_id/doubt/:doubt_id/replies", authMiddleware, async (req, res) => {
    try {
        const { doubt_id } = req.params;
        const replies = await client.query(`SELECT * FROM doubt_reply WHERE doubt_id=$1;`, [doubt_id]);
        res.json({ replies: replies.rows, message: "Replies fetched" });
    } catch (err) {
        res.status(500).json({ message: "Cannot fetch replies" });
    }
});

router.get("/class/:class_id/doubt/:doubt_id/discussions", authMiddleware, async (req, res) => {
    try {
        const { doubt_id } = req.params;
        const discussions = await client.query(`
            SELECT dsd.*, s.first_name, s.last_name
            FROM doubt_student_discussion dsd
            JOIN student s ON s.id = dsd.student_id
            WHERE dsd.doubt_id=$1
            ORDER BY dsd.id ASC;
        `, [doubt_id]);
        res.json({ discussions: discussions.rows, message: "Discussions fetched" });
    } catch (err) {
        res.status(500).json({ message: "Cannot fetch discussions" });
    }
});
