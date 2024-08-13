import eventEmmitter from "../emmitter/event.emitter.js";
import { Notification } from "../../notification/notification.js";
import Attachment from "../../model/attachment.js";
import Biodata from "../../model/biodata.js";
import { Op } from "sequelize";
import { sequelize } from "../../../database/index.js";
import app from "../../../config/app.js";

// APPLICATION SUBITTED
eventEmmitter.on("recover-attachments", async () => {
    try {
        console.log("recover-attachments emmitted");
        const attachmentsToRecover = await Attachment.findAll({
            attributes: [
                'applicantId',
                [sequelize.col('Biodatum.id'), 'biodataId'],
                [sequelize.col('Biodatum.email'), 'email'],
            ],
            where: {
                url: { [Op.like]: '%.doc%' }
            },
            include: [{ model: Biodata, attributes: ['id', 'email', 'firstName'] }],
            group: ['applicantId'],
        });
        if (attachmentsToRecover.length) {
            for (const attachment of attachmentsToRecover) {
                const url = `${app.web_url}/upload-attachment?_rdx=${Buffer.from(JSON.stringify(attachment['dataValues']['Biodatum']['dataValues']['id'])).toString('base64')}`;
                const subject = "Application Attachments Update";
                const mailBody = `
                               <p style="font-family: sans-serif; font-size: 16px; line-height: 1.5; margin: 0 0 20px; color: #333">
                               Dear  ${attachment['dataValues']['Biodatum']['dataValues']['firstName']},
                             </p>
                             <p style="font-family: sans-serif; font-size: 16px; line-height: 1.5; margin: 0 0 20px; color: #333">
                              We noticed your attachments uploaded during application for AHP intership program were among the a few affected  attachments.
                                We want to plead with you to re-upload the intially uploaded attachments to facilitate review process of the applications using this link.
                                <a href="${url}">re-upload attachments here</a>
                             </p>
                             <p style="margin: 0">
                              Please action as soon as you see this email.
                             </p>
                             <p>
                               Best regards,
                             </p>
                             <footer>
                               <p>
                               © ${new Date().getFullYear()} AHP. All rights reserved
                               </p>
                             </footer>
                 `;
                const notify = new Notification(attachment['dataValues']['Biodatum']['dataValues']['email'], subject, mailBody);
                await notify.via('viaEmail')
            }
        }
    } catch (error) {
        console.log({ error: error.message });
    }
});