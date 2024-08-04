import express from 'express';
import cors from 'cors';
import { appRouter } from './router.js';
import { ApiResponder } from './app/middleware/api.responder.js';
import path from "path";
import { fileURLToPath } from "url";
import "./app/events/listeners/application.events.js";
import "./app/events/listeners/bc.insert.js";
import "./app/events/listeners/account.activation.js";
import "./app/events/listeners/forgot.password.js";

const app = express();
const port = process.env.PORT || 3500;

// SEETINGs
app.use(cors());
app.use(express.json({limit: '4096mb'}));
app.use(ApiResponder);

// Static files middleware
const _filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(_filename);
app.use('/public', express.static(path.join(__dirname, 'public')));

// USE ROUTER
app.use('/onboarder/api', appRouter);



app.listen(port, ()=> {
    console.log(`Server is running at http://localhost:${port}`);
});
