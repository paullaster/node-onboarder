import express from 'express';
import { ApplicationController } from './app/controller/applications/application.controller.js';

const appRputer = express.Router();

// ROUTES
appRputer.post('/application', new ApplicationController().application);

export { appRputer };