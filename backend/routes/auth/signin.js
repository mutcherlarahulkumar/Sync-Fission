import express from "express";
import jwt from "jsonwebtoken";
import { getClient } from "../../db.js";
import zod from "zod";

const signinBody = zod.object({
    email: zod.string().email(),
    password: zod.string().min(6),
    });

export const router = express();

router.post("/tutor", async(req, res) => {
    // handle signin for tutor
    const client = await getClient();
    const {success} = signinBody.safeParse(req.body);
    if(!success){
        res.status(400).json({error: "Invalid request body"});
        return;
    }
    const {email, password} = req.body;
    try{
        const result = await client.query(`
        SELECT * FROM tutor
        WHERE email = $1 AND password = $2;
    `, [email, password]);
    if(result.rows.length === 0){
        res.status(401).json({error: "Invalid credentials"});
        return;
    }
    const tutor_id = result.rows[0].id;
    console.log("Tutor_id from Signin : ",tutor_id);
    const token = jwt.sign({id:tutor_id}, "rahulkumar");

    res.status(200).json({message: "Tutor signed in", token: token});
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Internal server error"});
    }
});

router.post("/student", async(req, res) => {
    // handle signin for student
    const client = await getClient();
    const {success} = signinBody.safeParse(req.body);
    if(!success){
        res.status(400).json({error: "Invalid request body"});
        return;
    }
    const {email, password} = req.body;
    try{
        const result = await client.query(`
        SELECT * FROM student
        WHERE email = $1 AND password = $2;
    `, [email, password]);
    if(result.rows.length === 0){
        res.status(401).json({error: "Invalid credentials"});
        return;
    }
    const student_id = result.rows[0].id;
    console.log("Student_Id from signin : ",student_id);
    const token = jwt.sign({id:student_id}, "rahulkumar");
    console.log("token from signin : ",token);

    res.status(200).json({message: "Student signed in", token: token});
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Internal server error"});
    }
});