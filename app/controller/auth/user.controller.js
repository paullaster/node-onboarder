import User from "../../model/user";
import jwt from 'jsonwebtoken';
import app from "../../config/app.js";
import Token from "../../model/token.js";
import { Notification } from "../../notification/notification.js";
import bcrypt from 'bcryptjs';
export class UserController {
    constructor() {
        this.login = this.login.bind(this);
    }
    async login(req, res) {
      try {
        if(!req.body) {}
        const { email, password } = req.body;
        if(!email ||!password) return res.ApiResponse.error(500, "Missing email or password");
        const user  = await User.findOne({where: {email: email}});
        if(!user) return res.ApiResponse.error(404, "User not found");
        const isPasswordMatch  = await bcrypt.compare(password, user.password)
        if (isPasswordMatch !== true) {
            return { error: "Password mismatch", success: false };
        }
        const token = jwt.sign({userId: user.email, email: user.email}, app.key, {algorithm: 'HS512', expiresIn: '10h' });
          return res.ApiResponse.success(token, 200, "Login successful");
      } catch (error) {
        
      }
    }
    async activateAccount(req, res) {
        try {
            if (!req.body) return res.ApiResponse.error(500, "Missing payload");
            if (!req.body.email) return res.ApiResponse.error(500, "Missing email");

            const user = await User.findOne({ where: { email: req.body.email } });
            if (!user) return res.ApiResponse.error(404, "User not found");

            if (user.active) return res.ApiResponse.error(404, "Account activated already, Pleae proceed to login");
            const { role, email } = user;
            const token =   jwt.sign({role, email}, app.key,  {algorithm: 'HS512', expiresIn: '1h' });
            const data =  {
                key: token,
                userId: user.id,
                expiry: new Date(currentTime.getTime() + 3600000),
            };
            const userToken = await Token.create(data);
            const resetLink = `${app.web_url}/auth/activate/${userToken.key}`;
            const newEmail = new Notification();
            newEmail.via('viaEmail', {});
            res.ApiResponse.success({ token }, "Login successful", 200);
        } catch (error) {
            
        }
    }
    async forgotPassword(req, res) {}
    async resetPassword(req, res) {}
    async addConsotium(req, res) {
       try {
         if (!req.body) return res.ApiResponse.error(500, "Missing payload");
         if (req.query || req.query.type) return res.ApiResponse.error(500, "missing type query");

         req.body.role = req.query?.type === 'consultium'?  3 : 4; 
         const user = await User.create(req.body);
         res.ApiResponse.success(user, "Consoltium added successfully", 201);
       } catch (error) {
        return res.ApiResponse.error(500, error.message);
       }
    }
}