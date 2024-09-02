import User from '../../model/user.js';
import jwt from 'jsonwebtoken';
import app from "../../../config/app.js"
import Token from "../../model/token.js";
import bcrypt from 'bcrypt';
import { BCController } from '../bc/bc.controller.js';
import NTLMSERVICE from '../../services/ntlm.service.js';
import eventEmmitter from '../../events/emmitter/event.emitter.js';
import { RandomCodeGenerator } from '../../../util/unique.codes.js';
import OTP from '../../model/one.time.password.js';
import { Op } from 'sequelize';
export class UserController {
    constructor() {
        this.login = this.login.bind(this);
        this.hasPassword = this.hasPassword.bind(this);
        this.register = this.register.bind(this);
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
                     consortiaFilter: user['dataValues'].categoriesFilter,
                     isAdmin: user['dataValues'].isAdmin,
                     consoltium: user['dataValues'].consoltium,
                     belongsTo: user['dataValues'].belongsTo
                }, app.key, { algorithm: 'HS512', expiresIn: '10h' });
            return res.ApiResponse.success(token, 200, "Login successful");
        } catch (error) {
            
        }
    }
    async register (req, res) {
        try {
            if (!req.body) {
                return res.ApiResponse.error(500, "Missing payload");
            }
            const institutionCode = RandomCodeGenerator(3, 'INS');
            const hashedPassword = await this.hasPassword(req.body.password);
            const institution = {
                email: req.body.email,
                name: `${req.body.firstName} ${req.body.lastName}`,
                role: req.body.type,
                password: hashedPassword,
                active:false,
                phone:req.body.phone,
                consoltium: institutionCode,
                belongsTo: institutionCode,
                title: 'INSTITUTION ADMIN',
                emailed:false,
                categoriesFilter: '',
                countiesFilter:'',
            };
            const user = await User.create(institution);
            if (!user) {
                return res.ApiResponse.error(500, "Failed to create user, please try again later!");
            }
            return res.ApiResponse.success({  }, 200, "Account successfully created.");
        } catch (error) {
            return res.ApiResponse.error(500, "We were not able to complete your account registration, please try again later!", error.message);
        }
    }
    async sendOTP(req, res) {
        try {
            if (!req.body) return res.ApiResponse.error(500, "Missing payload");
            if (!req.body.email) return res.ApiResponse.error(500, "Missing email");
            const user = await User.findOne({ where: {email: req.body.email}});
            if (!user) return res.ApiResponse.error(500, "We don't have this user, please try to register again");
            if (user['dataValues'].active) return res.ApiResponse.error(500,  "You already an account, please login instead");
            const otp = RandomCodeGenerator(4, 'IN');
            const userOTP = await OTP.create(
                {
                    passcode: otp,
                    expiry: new Date(Date.now() + 600000), // 10 minutes
                    userId: user.id
                }
            );
            eventEmmitter.emit('send-account-otp', {email: req.body.email, userOTP});
            setTimeout(()=> {
                return res.ApiResponse.success({  }, 200, "We sent one time password to your email and phone number");
            }, 5000)
        } catch (error) {
            return res.ApiResponse.error(500, "We were not able to complete this action, please try again later!", error.message);
        }
    }
    async verifyOTP (req, res) {
        try {
            if (!req.body) return res.ApiResponse.error(500, "Missing payload");
            if (!req.body.email) return res.ApiResponse.error(500, "Missing email");
            if (!req.body.otp) return res.ApiResponse.error(500, "Missing otp");
            const userOTP = await OTP.findOne({ where: {passcode: req.body.otp, expiry: {[Op.gte]: new Date()}}});
            if (!userOTP) return res.ApiResponse.error(401, "Invalid OTP");
            const user = await User.findByPk(userOTP['dataValues'].userId);
            if (!user) return res.ApiResponse.error(401, "Invalid user");
            await user.update({ active: true });
            await userOTP.destroy();
            return res.ApiResponse.success({  }, 200, "Verification successful.");
        } catch (error) {
            return res.ApiResponse.error(500, "We were not able to complete this action, please try again later!", error.message);
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
                role: user.type === 'Admin' ? 'admin' : user.type === 'HR' ? 'hr': user.lead ? 'lead' : 'user',
                consoltium: user.no,
                active: false,
                belongsTo: user.belongsTo ?? null,
                title: user.title ?? null,
                categoriesFilter: user.type.toLowerCase() === 'hr' ? user.consortiaFilter : user.categoriesFilter,
                countiesFilter: user.countiesFilter,
                isAdmin: user.type === 'Admin',
                // consortiaFilter: user.consortiaFilter,
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
            eventEmmitter.emit('activate-account', {email, name, resetLink, type: user.type});
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
    async hasPassword(rawPassword) {
        try {
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            return await bcrypt.hash(rawPassword, salt);
        } catch (error) {
            return Promise.reject(new Error(error.message));
        }
    }
}