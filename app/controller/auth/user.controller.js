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
            
            const isPasswordMatch = await bcrypt.compare(password, user['dataValues'].password)
            console.log(isPasswordMatch);
            if (!isPasswordMatch) {
                return res.ApiResponse.error(401, 'Invalid password');
            }
            const token = jwt.sign({ userId: user.email, email: user.email }, app.key, { algorithm: 'HS512', expiresIn: '10h' });
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
            eventEmmitter.on('complete-email', ()=> {
                return res.ApiResponse.success({  }, 200, "Account activation link ahs been sent to your email.");
            });
            eventEmmitter.on('email-failed', ()=> {
                return res.ApiResponse.error(500, "Failed to send email, please try again later.");
            });
        } catch (error) {
            return res.ApiResponse.error(500, "Error while activating you account:  " + error.message);
        }
    }
    async forgotPassword(req, res) { }
    async resetPassword(req, res) { }
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