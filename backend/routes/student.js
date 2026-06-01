import express from 'express';
import { authMiddleware } from './auth/authmiddleware.js';
import { getClient } from '../db.js';
import jwt from "jsonwebtoken";

export const router = express.Router();
const client = await getClient();

router.get('/name', authMiddleware, async (req, res) => {
    try {
        const student_id = req.id;
        const student = await client.query(`SELECT * FROM student WHERE id = $1;`, [student_id]);
        res.json({ student: student.rows[0], message: 'Student info fetched' });
    } catch (err) {
        res.status(500).json({ message: 'Cannot fetch student info' });
    }
});

router.post('/enroll', authMiddleware, async (req, res) => {
    try {
        const student_id = req.id;
        const { classcode } = req.body;
        const decoded = jwt.verify(classcode, process.env.JWT_SECRET);
        const class_id = decoded.code;
        const enrolled = await client.query(`
            INSERT INTO class_student(class_id, student_id) VALUES($1, $2) RETURNING *;
        `, [class_id, student_id]);
        res.json({ enrolled: enrolled.rows[0], message: 'Enrolled successfully' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "Cannot enroll student in class" });
    }
});

router.get("/classes", authMiddleware, async (req, res) => {
    try {
        const student_id = req.id;
        const classes = await client.query(`
            SELECT class.* FROM class_student
            JOIN class ON class.id = class_student.class_id
            WHERE class_student.student_id=$1;
        `, [student_id]);
        res.json({ classes: classes.rows, message: "Classes fetched" });
    } catch (err) {
        res.status(500).json({ message: "Cannot fetch classes" });
    }
});

router.get("/class/:class_id", authMiddleware, async (req, res) => {
    try {
        const { class_id } = req.params;
        const classInfo = await client.query(`SELECT * FROM class WHERE id=$1;`, [class_id]);
        res.json({ classInfo: classInfo.rows[0], message: "Class info fetched" });
    } catch (err) {
        res.status(500).json({ message: "Cannot fetch class info" });
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
        const tutor_id = await client.query(`SELECT tutor_id FROM class WHERE id=$1;`, [class_id]);
        const tutor = await client.query(`SELECT * FROM tutor WHERE id=$1;`, [tutor_id.rows[0].tutor_id]);
        res.json({ students: students.rows, tutor: tutor.rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Cannot fetch students" });
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

router.get("/class/:class_id/resources", authMiddleware, async (req, res) => {
    try {
        const { class_id } = req.params;
        const resources = await client.query(`SELECT * FROM resource WHERE class_id=$1;`, [class_id]);
        res.json({ resources: resources.rows, message: "Resources fetched" });
    } catch (err) {
        res.status(500).json({ message: "Cannot fetch resources" });
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

router.post("/class/:class_id/askdoubt", authMiddleware, async (req, res) => {
    try {
        const student_id = req.id;
        const { class_id } = req.params;
        const { title, description } = req.body;
        const doubt = await client.query(`
            INSERT INTO doubt(title, description, student_id, class_id) VALUES($1, $2, $3, $4) RETURNING *;
        `, [title, description, student_id, class_id]);
        res.json({ doubt: doubt.rows[0], message: "Doubt submitted" });
    } catch (err) {
        res.status(500).json({ message: "Cannot submit doubt" });
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

router.get("/class/:class_id/doubt/:doubt_id/replies", authMiddleware, async (req, res) => {
    try {
        const { doubt_id } = req.params;
        const replies = await client.query(`SELECT * FROM doubt_reply WHERE doubt_id=$1;`, [doubt_id]);
        res.json({ replies: replies.rows, message: "Replies fetched" });
    } catch (err) {
        res.status(500).json({ message: "Cannot fetch replies" });
    }
});

router.post("/class/:class_id/doubt/:doubt_id/discuss", authMiddleware, async (req, res) => {
    try {
        const student_id = req.id;
        const { doubt_id } = req.params;
        const { reply } = req.body;
        const discussion = await client.query(`
            INSERT INTO doubt_student_discussion(reply, doubt_id, student_id) VALUES($1, $2, $3) RETURNING *;
        `, [reply, doubt_id, student_id]);
        res.json({ discussion: discussion.rows[0], message: "Comment posted" });
    } catch (err) {
        res.status(500).json({ message: "Cannot post comment" });
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
