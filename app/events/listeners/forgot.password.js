import eventEmmitter from "../emmitter/event.emitter.js";
import { Notification } from "../../notification/notification.js";
import User from "../../model/user.js";

// APPLICATION SUBITTED
eventEmmitter.on("forgot-password", async (payload) => {
    try {
        console.log("forgot-password emmitted");
        const subject = "Consortium password reset";
        const mailBody = `
                  <p style="font-family: sans-serif; font-size: 16px; line-height: 1.5; margin: 0 0 20px; color: #333">
                  Greetings,
                </p>
                <p style="font-family: sans-serif; font-size: 16px; line-height: 1.5; margin: 0 0 20px; color: #333">
                 Click on this link to complete your password reset <a href="${payload.resetLink}">reset password</a>.
                </p>
                <p style="margin: 0">
                 You can also copy the link below in a new tab.
                </p>
                <p>
                    If you did not initiate password reset, you can safely ingnore this email.
                </p>
                <p>
                  Best regards,
                </p>
                <p><strong>The AHP Team</strong></p>
                <footer>
                    <p>
                     <a href="${payload.resetLink}" target="_blank">
                     ${payload.resetLink}
                     </a>
                    </p>
                  <p>
                  © ${new Date().getFullYear()} AHP. All rights reserved
                  </p>
                </footer>
    `;
        const notify = new Notification(payload.email, subject, mailBody);
        notify.via('viaEmail').then(({success}) =>{
            if (success) {
                    return eventEmmitter.emit('complete-email');
                }
            else {
                return eventEmmitter.emit('email-failed');
            }
        });
    } catch (error) {
        console.log({ error: error.message });
    }
});