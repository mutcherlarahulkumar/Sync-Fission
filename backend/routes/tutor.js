import express from 'express';
import { authMiddleware } from './auth/authmiddleware.js';
import { getClient } from '../db.js';
import zod from 'zod';
import jwt from 'jsonwebtoken';

export const router = express();
const client = await getClient();

router.get('/', (req, res) => {
  res.send('This extracts landing page for tutor user role');
});

router.get("/dashboard",authMiddleware,async(req,res)=>{
  const tutor_id = req.id;
  const tutor = await client.query(`
    SELECT * FROM tutor WHERE id=$1;
  `,[tutor_id]);
  res.json({tutor:tutor,message:"This extracts tutors dashboard"});
})

router.get("/name",authMiddleware,async(req,res)=>{
  const tutor_id = req.id;
  const tutor = await client.query(`
    SELECT * FROM tutor WHERE id=$1;
  `,[tutor_id]);
  res.json({tutor:tutor,message:"This extracts tutors dashboard"});
})

const createClassSchema = zod.object({
  name: zod.string(),
  description : zod.string(),
  book_ref: zod.string(),
  prereqs: zod.string()
});

router.post("/createclass",authMiddleware,async(req,res)=>{
  //create class page
  const tutor_id = req.id;
  const parseddata = createClassSchema.parse(req.body);
  const {name,description,book_ref,prereqs} = parseddata;
  const newClass = await client.query(`
    INSERT INTO class(name,description,book_ref,prereqs,tutor_id) VALUES($1,$2,$3,$4,$5) RETURNING *;
  `,[name,description,book_ref,prereqs,tutor_id]);
  res.json({newClass:newClass,message:"This  creates new class taught by tutor"});
});

router.get("/classes",authMiddleware,async(req,res)=>{
  try{
    const tutor_id = req.id;
  const classes = await client.query(`
    SELECT * FROM class WHERE tutor_id=$1;
  `,[tutor_id]);
  res.json({classes:classes.rows,message:"This extracts classes taught by tutor"});
  }catch(err){
    res.json({message:"Cannot extract classes taught by tutor"});
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
  res.json({ students: students.rows });
  }catch(err){
    res.json({message:"Cannot extract students in class"});
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


router.post("/class/:class_id/createassignment", authMiddleware, async (req, res) => {
  try {
      const { class_id } = req.params;
      const { title,link, description, due_date } = req.body;
      const newAssignment = await client.query(`
          INSERT INTO assignment(title,link, description, due_date, class_id) 
          VALUES($1, $2, $3, $4, $5) RETURNING *;
      `, [title, link, description, due_date, class_id]);
      res.json({ assignment: newAssignment.rows[0], message: "Assignment created successfully" });
  } catch (err) {
      res.json({ message: "Cannot create assignment" });
  }
});

router.get("/class/:class_id/assignments",authMiddleware,async(req,res)=>{
  try{
    const { class_id } = req.params;
    const assignments = await client.query(`SELECT * FROM assignment WHERE class_id=$1;`,[class_id]);
    res.json({assignments:assignments.rows,message:"These are the Assignemts"});
  }catch(err){
    res.json({message:"Cannot extract announcements for class"});
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

router.post("/class/:class_id/addannouncement",authMiddleware,async(req,res)=>{
  try{
    const {class_id} = req.params;
  const {title,description} = req.body;
  const newAnnouncement = await client.query(`
    INSERT INTO announcement(title,description,class_id) VALUES($1,$2,$3) RETURNING *;
  `,[title,description,class_id]);
  res.json({newAnnouncement:newAnnouncement.rows,message:"This adds new announcement for class"});
  }catch(err){
    res.json({message:"Cannot add new announcement for class"});
  }
});

router.post("/class/:class_id/addresource",authMiddleware,async(req,res)=>{
  try{
  const {class_id} = req.params;
  const {type,title,link} = req.body;
  const newResource = await client.query(`
    INSERT INTO resource(type,title,link,class_id) VALUES($1,$2,$3,$4) RETURNING *;
  `,[type,title,link,class_id]);
  res.json({newResource:newResource.rows,message:"This adds new resource for class"});
  }catch(err){
    res.json({message:"Cannot add new resource for class"});
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



router.post("/class/:class_id/doubt/:doubt_id/reply",authMiddleware,async(req,res)=>{
  try{
    const tutor_id = req.id;
  const {doubt_id} = req.params;
  const {reply} = req.body;
  const doubt_reply = await client.query(`
    INSERT INTO doubt_reply(reply,doubt_id) VALUES($1,$2) RETURNING *;
  `,[reply,doubt_id]);
  res.json({doubt_reply:doubt_reply.rows[0],message:"This replies to doubt for class"});
  }
  catch(err){
    res.json({message:"Cannot reply to doubt for class",error:err.message});
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


