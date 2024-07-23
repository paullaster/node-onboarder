import express from 'express';
import { ApplicationController } from './app/controller/applications/application.controller.js';
import { ApplicationsController } from './app/controller/applications/get.controller.js';
import { setupRoutes } from './routes/setup.routes.js';
import { userRoutes } from './routes/user.routes.js';


const appRouter = express.Router();

// ROUTES


// APPLICATIONS
// appRouter.post('/application', new ApplicationController().application);
appRouter.get('/applications', new ApplicationsController().applications);
appRouter.get('/application/:id', new ApplicationsController().application);
appRouter.post('/application/push', new ApplicationController().pushApplication);

// AUTH
appRouter.use('/auth', userRoutes);


// SETUP ROUTES
appRouter.use('/setup', setupRoutes);

export { appRouter };
