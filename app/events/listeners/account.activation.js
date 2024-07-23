import eventEmmitter from "../emmitter/event.emitter.js";
import { Notification } from "../../notification/notification.js";
import User from "../../model/user.js";

// APPLICATION SUBITTED
eventEmmitter.on("activate-account", async(payload) => {
    try {
        console.log("activate-account emmitted");
    const subject = "Consoltium Account Activation";
    const mailBody = `
                  <p style="font-family: sans-serif; font-size: 16px; line-height: 1.5; margin: 0 0 20px; color: #333">
                  Dear  ${payload.name},
                </p>
                <p style="font-family: sans-serif; font-size: 16px; line-height: 1.5; margin: 0 0 20px; color: #333">
                 Your <strong>AHP</strong> account activation link is  ready! click <a href="${payload.resetLink}">here</a>.
                </p>
                <p style="margin: 0">
                 Click the link to activate your consoltium portal.
                </p>
                <p>
                  Best regards,
                </p>
                <p><strong>The AHP Team</strong></p>
    `;
    const notify = new Notification(payload.email, subject, mailBody);
    const {success} = await notify.via('viaEmail');
    const getUser = await User.findOne({where: {email: payload.email}});
    console.log(payload.resetLink);
    if (success) {
        if (getUser) {
            await getUser.update({emailed: true});
            eventEmmitter.emit('complete-email');
        }
    }
    //else {
    //     if (getUser) {
    //         await getUser.destroy();
    //     }
    //     eventEmmitter.emit('email-failed');
    // }
    } catch (error) {
        console.log({error: error.message});
    }
});