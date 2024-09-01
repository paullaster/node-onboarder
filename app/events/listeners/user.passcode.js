import eventEmmitter from "../emmitter/event.emitter.js";
import { Notification } from "../../notification/notification.js";
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const _filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(_filename);
import User from "../../model/user.js";

eventEmmitter.on("send-account-otp", (payload) => {
    try {
        console.log(`Sending OTP to ${payload.email}`);
        const subject = "Affordable Housing Program Passcode is " + payload.userOTP['dataValues'].passcode;
        const templateUrl =  path.join(__dirname, '../../../resources/templates/OTP.html');
        const OTPMailTemplate = fs.readFileSync(templateUrl, 'utf8');
        const mailBody = OTPMailTemplate.replace('{{ otpCode }}', payload.userOTP['dataValues'].passcode).replace("{{ expirationTime }}", 10);
        const notify = new Notification(payload.email, subject, mailBody);
        notify.via('viaEmail').then(async ({success, data}) => {
            const user = await User.findByPk(payload.userOTP['dataValues'].userId);
            if (success) {
                console.log(`OTP sent to ${payload.email}`);
                user.update({ emailed: true });
            } else {
                console.error(`Failed to send OTP to ${payload.email}`);
            }
        })
    } catch (error) {
        
    }
    // Send OTP via email


    // Or via SMS

})