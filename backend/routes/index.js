import express from 'express';
import{router as tutorrouter} from './tutor.js';
import{router as studentrouter} from './student.js';
import {router as signuprouter} from './auth/signup.js';
import {router as signinrouter} from './auth/signin.js';
import {app as chatrouter} from './chatrouter.js';

const router = express();

router.get("/",(req,res)=>{
    res.send('This is a common landing page for both the user roles');
});

router.use("/signup", signuprouter);
router.use("/signin", signinrouter);
router.use("/tutor", tutorrouter);
router.use("/student", studentrouter);
router.use("/chat", chatrouter);

export default router;