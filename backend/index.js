import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import rootrouter from './routes/index.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1", rootrouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
