import User from '../../model/user.js';
import jwt from 'jsonwebtoken';
import app from "../../../config/app.js"
import Token from "../../model/token.js";
import bcrypt from 'bcrypt';
import { BCController } from '../bc/bc.controller.js';
import NTLMSERVICE from '../../services/ntlm.service.js';
import eventEmmitter from '../../events/emmitter/event.emitter.js';
export class UserController {
    constructor() {
        this.login = this.login.bind(this);
    }
    async login(req, res) {
        try {
            if (!req.body) {
                return res.ApiResponse.error(500, "Missing payload");
            }
            const { email, password } = req.body;
            if (!email || !password)  {
                return res.ApiResponse.error(500, "Missing email or password");
            }
            const user = await User.findOne({ where: {email: email}});
            if (!user) {
                return res.ApiResponse.error(404, "User not found");
            };
            if (!user['dataValues'].active) {
                await user.destroy();
                return res.ApiResponse.error(401, "Account is not activated");
            }
            const isPasswordMatch = await bcrypt.compare(password, user['dataValues'].password);
            if (!isPasswordMatch) {
                return res.ApiResponse.error(401, 'Invalid password');
            }
            const token = jwt.sign(
                { 
                    id: user['dataValues'].id,
                    email: user['dataValues'].email, 
                     name: user['dataValues'].name, 
                     role: user['dataValues'].role,
                     title: user['dataValues'].title,
                     categoriesFilter: user['dataValues'].categoriesFilter,
                     countiesFilter: user['dataValues'].countiesFilter,
                     consoltium: user['dataValues'].consoltium,
                     belongsTo: user['dataValues'].belongsTo
                }, app.key, { algorithm: 'HS512', expiresIn: '10h' });
            return res.ApiResponse.success(token, 200, "Login successful");
        } catch (error) {
            
        }
    }
    async activateAccount(req, res) {
        try {
            if (!req.body) return res.ApiResponse.error(500, "Missing payload");
            if (!req.body.email) return res.ApiResponse.error(500, "Missing email");
            const existInPortal = await User.findOne({where: {email: req.body.email}});
            if (existInPortal) return res.ApiResponse.error(409, "Email already exists in the portal, Please login or reset your password!");
            const transport = new NTLMSERVICE('consortia');
            const bcInstance =  new BCController(transport);
            const {data:consoltium, success, error} = await bcInstance.getConsoltium({eMail: req.body.email});
            if (!success) return res.ApiResponse.error(407, error);
            if (!consoltium?.value) {
                return res.ApiResponse.error(409, "We can't find this email!");
            }
            const user = Array.isArray(consoltium.value) ? consoltium?.value[0] : consoltium.value;
            const newUser = {
                email: user.eMail,
                name: user.name,
                phone: user.phone,
                role: user.lead ? 'lead' : 'user',
                consoltium: user.no,
                active: false,
                belongsTo: user.belongsTo ?? null,
                title: user.title ?? null,
                categoriesFilter: user.categoriesFilter,
                countiesFilter: user.countiesFilter
            };
            const createdUser = await User.create(newUser);
            if (!createdUser) return res.ApiResponse.error(409, "Sorry!, We ran into an error while activating the user");
            const { id, email, name } = createdUser;
            const token = jwt.sign({ email }, app.key, { algorithm: 'HS512', expiresIn: '1h' });
            const data = {
                key: token,
                userId: id,
                expiry: new Date(Date.now() + 3600000),
            };
            const userToken = await Token.create(data);
            const resetLink = `${app.web_url}/auth/set-password/${userToken.key}`;
            eventEmmitter.emit('activate-account', {email, name, resetLink});
            // eventEmmitter.on('complete-email', ()=> {
            //     return res.ApiResponse.success({  }, 200, "Account activation link ahs been sent to your email.");
            // });
            // eventEmmitter.on('email-failed', ()=> {
            //     return res.ApiResponse.error(500, "Failed to send email, please try again later.");
            // });
            return res.ApiResponse.success({  }, 200, "Account activation link has been sent to your email.");
        } catch (error) {
            return res.ApiResponse.error(500, "Error while activating you account:  " + error.message);
        }
    }
    async forgotPassword(req, res) {
        try {
            if (!req.body) return res.ApiResponse.error(500, "Missing payload");
            if (!req.body.email) return res.ApiResponse.error(500, "Missing email");
            const user = await User.findOne({where: {email: req.body.email}});
            if (!user) return res.ApiResponse.error(404, "User not found");
            const token = jwt.sign({ email: user.email }, app.key, { algorithm: 'HS512', expiresIn: '1h' });
            const data = {
                key: token,
                userId: user['dataValues'].id,
                expiry: new Date(Date.now() + 3600000),
            };
            const userToken = await Token.create(data);
            const resetLink = `${app.web_url}/auth/set-password/${userToken.key}`;
            eventEmmitter.emit('forgot-password', {email: user['dataValues'].email, resetLink});
            // eventEmmitter.on('complete-email', ()=> {
            //     return res.ApiResponse.success({  }, 200, "Reset password link has been sent to your email.");
            // });
            // eventEmmitter.on('email-failed', ()=> {
            //     return res.ApiResponse.error(500, "Failed to send email, please try again later.");
            // });
            return res.ApiResponse.success({  }, 200, "Reset password link has been sent to your email.");
        } catch (error) {
            return res.ApiResponse.error(500, "Error while sending forgot password email:  " + error.message);
        }
    }
    async setPassword(req, res) { 
        try {
            if (!req.body) return res.ApiResponse.error(500, "Invalid body");
            const token = jwt.verify(req.body.token, app.key, {algorithms: 'HS512'});
            if (!token.email) return res.ApiResponse.error(401, "Invalid token");
            const user = await User.findOne({where: {email: token.email}});
            if (!user) return res.ApiResponse.error(404, "User not found");
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            user.password = await bcrypt.hash(req.body.password, salt);
            user.active = true;
            const usedToken = await Token.findOne({ where: { userId: user['dataValues'].id}});
            if (usedToken) await usedToken.destroy();
            await user.save();
            return res.ApiResponse.success({}, 200, "User password was set successfully");
        } catch (error) {
            return res.ApiResponse.error(500, "Error while creating user password:  " + error.message);
        }
     }
    async addConsotium(req, res) {
        try {
            if (!req.body) return res.ApiResponse.error(500, "Missing payload");
            if (req.query || req.query.type) return res.ApiResponse.error(500, "missing type query");

            req.body.role = req.query?.type === 'consultium' ? 3 : 4;
            const user = await User.create(req.body);
            res.ApiResponse.success(user, "Consoltium added successfully", 201);
        } catch (error) {
            return res.ApiResponse.error(500, error.message);
        }
    }
}