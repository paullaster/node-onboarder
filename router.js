import express from 'express';
import { ApplicationController } from './app/controller/applications/application.controller.js';
import { ApplicationsController } from './app/controller/applications/get.controller.js';
import { setupRoutes } from './routes/setup.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { validateUserToken } from './app/middleware/verify.user.token.js';


const appRouter = express.Router();
// ROUTES


// APPLICATIONS
appRouter.post('/application', new ApplicationController().application);
appRouter.get('/applications', validateUserToken, new ApplicationsController().applications);
appRouter.get('/application/:id', validateUserToken, new ApplicationsController().application);
appRouter.post('/application/push', new ApplicationController().pushApplication);
appRouter.post('/accept/application', validateUserToken, new ApplicationController().acceptApplication);
appRouter.post('/batch/accept/applications', validateUserToken, new ApplicationController().acceptBatchApplications);
appRouter.post('/peer/review/application', validateUserToken, new ApplicationController().peerReviewApplication);
appRouter.post('/batch/peer/review/applications', validateUserToken, new ApplicationController().batchPeerReviewApplications);
appRouter.post('/recover/attachments',  new ApplicationController().uploadAttachments)
// AUTH
appRouter.use('/auth', userRoutes);


// SETUP ROUTES
appRouter.use('/setup', setupRoutes);

export { appRouter };
