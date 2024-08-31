import express from 'express';
import { UserController } from "../app/controller/auth/user.controller.js";


const userRoutes = express.Router();

userRoutes.post('/login', new UserController().login);
userRoutes.post('/register', new UserController().register);
userRoutes.post('/send-otp', new UserController().sendOTP);
userRoutes.post('/verify-otp', new UserController().verifyOTP);
userRoutes.post('/activate', new UserController().activateAccount);
userRoutes.post('/forgot-password', new UserController().forgotPassword);
userRoutes.post('/set-password', new UserController().setPassword);

// USER
userRoutes.post('/user/', new UserController().addConsotium);

export {userRoutes};