import express from 'express';
import {authMiddleware} from './auth/authmiddleware.js';
import {getClient} from '../db.js';
import jwt from "jsonwebtoken";

export const router = express();
const client = await getClient();



router.get('/name',authMiddleware,async (req, res) => {

  const student_id = req.id;
  const student = await client.query(`
    SELECT * FROM student WHERE id = $1;  
  `,[student_id]);
  res.json({student:student.rows[0],message:'This extracts dashboard page for student user role'});
});

router.post('/enroll',authMiddleware,async (req, res) => {

  try{
    const student_id = req.id;
  const {classcode} = req.body;

  const decoded = jwt.verify(classcode,"rahulkumar");
  const class_id = (decoded.code);
  const enrolled = await client.query(`
    INSERT INTO class_student(class_id,student_id) VALUES($1,$2) RETURNING *;
  `,[class_id,student_id]);
  res.json({enrolled:enrolled.rows[0],message:'This enrolls student in a class'});
  }catch(err){
    console.log(err);
    res.json({message:"Cannot enroll student in class"});
  }
});

router.get("/classes",authMiddleware,async(req,res)=>{
  try{
    const student_id = req.id;
  const classes = await client.query(`
    SELECT class.* FROM class_student
    JOIN class ON class.id = class_student.class_id
    WHERE class_student.student_id=$1;
  `,[student_id]);
  res.json({classes:classes.rows,message:"This extracts classes enrolled by student"});
  }catch(err){
    res.json({message:"Cannot extract classes enrolled by student"});
  }
});


router.get("/class/:class_id",authMiddleware,async(req,res)=>{
  try{
    const {class_id} = req.params;
  const classInfo = await client.query(`
    SELECT * FROM class WHERE id=$1;
  `,[class_id]);
  const classcode = jwt.sign({code:class_id},"rahulkumar");
  res.json({classInfo:classInfo.rows[0],classcode:classcode,message:"This extracts class info"});
  }catch(err){
    res.json({message:"Cannot extract class info"});
  }
});

router.post('/class/students', authMiddleware, async (req, res) => {
  try{
    const { class_id } = req.body;
  const students = await client.query(`
      SELECT student.* 
      FROM student
      JOIN class_student ON student.id = class_student.student_id
      WHERE class_student.class_id = $1;
  `, [class_id]);
  const tutor_id = await client.query(`
    SELECT tutor_id FROM class WHERE id=$1;
  `,[class_id]);
  const tutor = await client.query(`
    SELECT * FROM tutor WHERE id=$1;
  `,[tutor_id.rows[0].tutor_id]);
  res.json({ students: students.rows,tutor:tutor.rows[0] });
  }catch(err){
    res.json({message:"Cannot extract students in class"});
  }
});

router.get("/class/:class_id/announcements",authMiddleware,async(req,res)=>{
  try{
    const {class_id} = req.params;
  const announcements = await client.query(`
    SELECT * FROM announcement WHERE class_id=$1;
  `,[class_id]);
  res.json({announcements:announcements.rows,message:"This extracts announcements for class"});
  }catch(err){
    res.json({message:"Cannot extract announcements for class"});
  }
});

router.get("/class/:class_id/resources",authMiddleware,async(req,res)=>{
  try{
    const {class_id} = req.params;
  const resources = await client.query(`
    SELECT * FROM resource WHERE class_id=$1;
  `,[class_id]);
  res.json({resources:resources.rows,message:"This extracts resources for class"});
  }
  catch(err){
    res.json({message:"Cannot extract resources for class"});
  }
}
);

router.post("/class/:class_id/askdoubt",authMiddleware,async(req,res)=>{
  try{
    const student_id = req.id;
  const {class_id} = req.params;
  const {title,description} = req.body;
  const doubt = await client.query(`
    INSERT INTO doubt(title,description,student_id,class_id) VALUES($1,$2,$3,$4) RETURNING *;
  `,[title,description,student_id,class_id]);
  res.json({doubt:doubt.rows[0],message:"This posts doubt for class"}); 
  }
  catch(err){
    res.json({message:"Cannot post doubt for class"});
  }
});

router.get("/class/:class_id/doubts",authMiddleware,async(req,res)=>{
  try{
    const {class_id} = req.params;
  const doubts = await client.query(`
    SELECT * FROM doubt WHERE class_id=$1;
  `,[class_id]);
  res.json({doubts:doubts.rows,message:"This extracts doubts for class"});
  }
  catch(err){
    res.json({message:"Cannot extract doubts for class"});
  }
});

router.get("/class/:class_id/doubt/:doubt_id/replies",authMiddleware,async(req,res)=>{
  try{
    const {doubt_id} = req.params;
  const replies = await client.query(`
    SELECT * FROM doubt_reply WHERE doubt_id=$1;
  `,[doubt_id]);
  res.json({replies:replies.rows,message:"This extracts replies for doubt"});
  }
  catch(err){
    res.json({message:"Cannot extract replies for doubt"});
  }
}
);

router.get("/class/:class_id/doubt/:doubt_id",authMiddleware,async(req,res)=>{
  try{
    const {doubt_id} = req.params;
  const doubt = await client.query(`
    SELECT * FROM doubt WHERE id=$1;
  `,[doubt_id]);
  const student = await client.query(`
    SELECT * FROM student WHERE id=$1;
  `,[doubt.rows[0].student_id]);
  res.json({doubt:doubt.rows[0],student:student,message:"This extracts doubt"});
  }
  catch(err){
    res.json({message:"Cannot extract doubt"});
  }
});

router.post("/class/:class_id/doubt/:doubt_id/discuss",authMiddleware,async(req,res)=>{
  try{
    const student_id = req.id;
  const {class_id,doubt_id} = req.params;
  const {reply} = req.body;
  const discussion = await client.query(`
    INSERT INTO doubt_student_discussion(reply,doubt_id,student_id) VALUES($1,$2,$3) RETURNING *;
  `,[reply,doubt_id,student_id]);
  res.json({discussion:discussion.rows[0],message:"This posts discussion for doubt"}); 
  }
  catch(err){
    res.json({message:"Cannot post discussion for doubt"});
  }
});

router.get("/class/:class_id/doubt/:doubt_id/replies",authMiddleware,async(req,res)=>{
  try{
    const {doubt_id} = req.params;
  const replies = await client.query(`
    SELECT * FROM doubt_reply WHERE doubt_id=$1;
  `,[doubt_id]);
  res.json({replies:replies.rows,message:"This extracts replies for doubt"});
  }
  catch(err){
    res.json({message:"Cannot extract replies for doubt"});
  }
}
);


router.get("/class/:class_id/doubt/:doubt_id/discussions",authMiddleware,async(req,res)=>{
  try{
    const {doubt_id} = req.params;
  const discussions = await client.query(`
    SELECT * FROM doubt_student_discussion WHERE doubt_id=$1;
  `,[doubt_id]);
  res.json({discussions:discussions.rows,message:"This extracts discussions for doubt"});
  }
  catch(err){
    res.json({message:"Cannot extract discussions for doubt"});
  }
}
);

router.get("/class/:class_id/assignments",authMiddleware,async(req,res)=>{
  try{
    const {class_id} = req.params;
  const assignments = await client.query(`
    SELECT * FROM assignment WHERE class_id=$1;
  `,[class_id]);
  res.json({assignments:assignments.rows,message:"This extracts assignments for class"});
  }
  catch(err){
    res.json({message:"Cannot extract assignments for class"});
  }
});

router.get("/class/:class_id/doubts",authMiddleware,async(req,res)=>{
  try{
    const {class_id} = req.params;
  const doubts = await client.query(`
    SELECT * FROM doubt WHERE class_id=$1;
  `,[class_id]);
  res.json({doubts:doubts.rows,message:"This extracts doubts for class"});
  }
  catch(err){
    res.json({message:"Cannot extract doubts for class"});
  }
});