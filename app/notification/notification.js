
import { EmailNotification } from "./email.notification";
export class Notification {
    constructor(email, subject, body) {
        this.email = email;
        this.subject = subject;
        this.body = body;
    }
    async via(channel) {
        try {
            const mailable = {
                email: this.notifiable,
                subject: this.subject,
                html: this.body,
            }
            switch(channel) {
                case 'viaEmail':
                    return await new EmailNotification().send(mailable);
                case 'viaSms':
                    return;
    
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    sendSms() {}
}