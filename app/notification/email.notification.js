import transporter from "../services/mail.service.js";
import { mail } from "../../config/email.js";
export class EmailNotification {
    async send(mailable, ...args) {
        try {
            // const info = await transporter.sendMail({
            //     from: mail.from,
            //     to: mailable.email,
            //     subject: mailable.subject,
            //     html: mailable.html,
            //     ...args,
            // });
            console.log("transport", await transporter.sendMail({
                from: mail.from,
                to: mailable.email,
                subject: mailable.subject,
                html: mailable.html,
                ...args,
            }))

            transporter.close();
            return {success: true, data: info};
    } catch(error) {
        console.log(error);
        return {success: false, error: error.message};
    }
}
}