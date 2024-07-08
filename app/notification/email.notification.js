import transporter from "../services/mail.service";
export class EmailNotification {
    async send(mailable, ...args) {
        try {
            const info = await transporter.sendMail({
                from: mail.from,
                to: mailable.email,
                subject: mailable.subject,
                html: mailable.html,
                ...args,
            });

            transporter.close();
            return {success: true, data: info};
    } catch(error) {
        console.error(`Error sending email: ${error.message}`);
    }
}
}