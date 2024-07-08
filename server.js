import express from 'express';
import cors from 'cors';
import { appRouter } from './router.js';
import { ApiResponder } from './app/middleware/api.responder.js';
import path from "path";
import { fileURLToPath } from "url";
import { Admin } from './adapters/admin.js';

const app = express();
const port = process.env.PORT || 3500;

// SEETINGs
app.use(cors());
app.use(express.json());
app.use(ApiResponder);

// Static files middleware
const _filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(_filename);
app.use('/public', express.static(path.join(__dirname, 'public')));

// USE ROUTER
app.use('/onboarder/api', appRouter);
app.use('/admin', Admin)



app.listen(port, ()=> {
    console.log(`Server is running at http://localhost:${port}`);
});
