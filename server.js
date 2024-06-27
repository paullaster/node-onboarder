import express from 'express';
import cors from 'cors';
import { appRputer } from './router.js';
import { ApiResponder } from './app/middleware/api.responder.js';
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3500;

// SEETINGs
app.use(cors());
app.use(express.json());

// Static files middleware
const _filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(_filename);
app.use('/public', express.static(path.join(__dirname, 'public')));

// USE ROUTER
app.use(ApiResponder);
app.use('/onboarder/api', appRputer);




app.listen(port, ()=> {
    console.log(`Server is running at http://localhost:${port}`);
});