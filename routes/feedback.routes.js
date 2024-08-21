import express from 'express';
import NTLMSERVICE from '../app/services/ntlm.service.js';
import { BCController } from '../app/controller/bc/bc.controller.js';
import { FeedbackController } from '../app/controller/feedback/Feedback.controller.js';


const feedbackRoutes = express.Router();

const transport = new NTLMSERVICE('comments')
const BCInstance = new BCController(transport);

feedbackRoutes.post('/leave', new FeedbackController(BCInstance).leaveFeedback);
feedbackRoutes.get('/history', new FeedbackController(BCInstance).getFeedbackHistory);

export {feedbackRoutes};