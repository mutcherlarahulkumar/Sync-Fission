import express from 'express';
import cors from 'cors';
import rootrouter from './routes/index.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1",rootrouter);

app.listen(3000, () => {    
    console.log('Server is running on port 3000');
});