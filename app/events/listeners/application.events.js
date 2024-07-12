import eventEmmitter from "../emmitter/event.emitter.js";
import { Notification } from "../../notification/notification.js";
import Application from "../../model/application.js";

// APPLICATION SUBITTED
eventEmmitter.on("applicationSubmitted", async(applicant) => {
    const subject = "AHP Graduate Programme Internship Application";
    const mailBody = `
                  <p style="font-family: sans-serif; font-size: 16px; line-height: 1.5; margin: 0 0 20px; color: #333">
                  Dear  ${applicant.firstName} ${applicant.lastName},
                </p>
                <p style="font-family: sans-serif; font-size: 16px; line-height: 1.5; margin: 0 0 20px; color: #333">
                 Thank you for your interest in <strong>AHP</strong>! We have received your application for the <strong>Graduate Programme Internship</strong> position.
                </p>
                <p style="margin: 0">
                 We'll be reviewing applications shortly and will be in touch if we'd like to learn more.
                </p>
                <p>
                  Best regards,
                </p>
                <p><strong>The AHP Team</strong></p>
    `;
    const notify = new Notification(applicant.email, subject, mailBody);
    const {success} = await notify.via('viaEmail');
    if (success) {
        const getApplication = await Application.findOne({where: {applicantId: applicant.id}});
        if (getApplication) {
            await getApplication.update({receivedNotified: true});
        }
    }
});