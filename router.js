import express from 'express';
import { ApplicationController } from './app/controller/applications/application.controller.js';
import { ApplicationsController } from './app/controller/applications/get.controller.js';

const appRouter = express.Router();

// ROUTES
appRouter.post('/application', new ApplicationController().application);
appRouter.get('/applications', new ApplicationsController().applications);
appRouter.get('/application/:id', new ApplicationsController().application);

export { appRouter };
