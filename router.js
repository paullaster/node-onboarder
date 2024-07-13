import express from 'express';
import { ApplicationController } from './app/controller/applications/application.controller.js';
import { ApplicationsController } from './app/controller/applications/get.controller.js';
import { UserController } from './app/controller/auth/user.controller.js';
import { setupRoutes } from './routes/setup.routes.js';


const appRouter = express.Router();

// ROUTES


// APPLICATIONS
appRouter.post('/application', new ApplicationController().application);
appRouter.get('/applications', new ApplicationsController().applications);
appRouter.get('/application/:id', new ApplicationsController().application);
appRouter.post('/application/push', new ApplicationController().pushApplication);

// AUTH
appRouter.post('/auth/login', new UserController().login);
appRouter.post('/auth/activate', new UserController().activateAccount);
appRouter.post('/auth/forgot-password', new UserController().forgotPassword);
appRouter.post('/auth/reset-password', new UserController().resetPassword);

// USER
appRouter.post('/user/add-consotium', new UserController().addConsotium);


// SETUP ROUTES
appRouter.use('/setup', setupRoutes);

export { appRouter };
