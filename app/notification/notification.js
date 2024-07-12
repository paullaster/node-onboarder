
import { EmailNotification } from "./email.notification.js";
export class Notification {
    constructor(email, subject, body) {
        this.email = email;
        this.subject = subject;
        this.body = body;
        this.via = this.via.bind(this);
    }
    async via(channel) {
        try {
            const mailable = {
                email: this.email,
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
}