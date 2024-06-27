import express from 'express';
import cors from 'cors';
import { appRputer } from './router';
import { ApiResponder } from './app/middleware/api.responder';

const app = express();
const port = process.env.PORT || 3500;

// SEETINGs
app.use(cors());
app.use(express.json());

// USE ROUTER
app.use(ApiResponder);
app.use('/onboarder/api', appRputer);




app.listen(port, ()=> {
    console.log(`Server is running at http://localhost:${port}`);
});