import express from "express";
import zod from "zod";
import pg from "pg";
import { getClient } from "../../db.js";
import jwt from "jsonwebtoken";


export const router = express();

const signupBody = zod.object({
    firstname: zod.string(),
    lastname: zod.string(),
    email: zod.string().email(),
    password: zod.string().min(6),
  });

router.post("/tutor", async(req, res) => {
  // handle signup for tutor
  const client = await getClient();
  const {success} = signupBody.safeParse(req.body);
    if(!success){
        res.status(400).json({error: "Invalid request body"});
        return;
    }
    const {firstname, lastname, email, password} = req.body;
    try{
        const result = await client.query(`
        INSERT INTO tutor(first_name, last_name, email, password)
        VALUES($1, $2, $3, $4)
        RETURNING *;
    `, [firstname, lastname, email, password]);
    const tutor_id = result.rows[0].id;
    console.log("Tutor_id from Signin : ",tutor_id);
    const token = jwt.sign({id:tutor_id}, "rahulkumar");

    res.status(201).json({message: "Tutor created",token: token});
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Internal server error/User already exists"});
    }
});

router.post("/student", async(req, res) => {
    // handle signup for student
    const client = await getClient();
    const {success} = signupBody.safeParse(req.body);
    if(!success){
        res.status(400).json({error: "Invalid request body"});
        return;
    }
    const {firstname, lastname, email, password} = req.body;
    try{
        const result = await client.query(`
        INSERT INTO student(first_name, last_name, email, password)
        VALUES($1, $2, $3, $4)
        RETURNING *;
    `, [firstname, lastname, email, password]);
    const student_id = result.rows[0].id;
    console.log("Student_Id from signup : ",student_id);
    const token = jwt.sign({id:student_id}, "rahulkumar");
    console.log("token from signup : ",token);
    res.status(201).json({message: "Student created",token: token});
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Internal server error/User already exists"});
    }
  });