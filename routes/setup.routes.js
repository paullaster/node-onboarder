import express from 'express';
import { BCController } from '../app/controller/bc/bc.controller.js';
import NTLMSERVICE from '../app/services/ntlm.service.js';

const setupRoutes = express.Router();


setupRoutes.get('/counties', new BCController(new NTLMSERVICE('counties')).getSetups);
setupRoutes.get('/categories', new BCController(new NTLMSERVICE('categories')).getSetups);
setupRoutes.get('/consortia', new BCController(new NTLMSERVICE('consortia')).getSetups);


export { setupRoutes};