
import { EmailNotification } from "./email.notification.js";
export class Notification {
    constructor(email, subject, body) {
        this.email = email;
        this.subject = subject;
        this.body = body;
        this.via = this.via.bind(this);
    }
    via(channel) {
        try {
            const mailable = {
                email: this.email,
                subject: this.subject,
                html: this.body,
            }
            switch(channel) {
                case 'viaEmail':
                    return new EmailNotification().send(mailable).then(({success, data, error}) => {
                        if (success) {
                            return Promise.resolve({success, data});
                        }else{
                            return Promise.reject({success, error});
                        }
                    });
                case 'viaSms':
                    return;
    
            }
        } catch (error) {
            return Promise.reject({ success: false, error: error.message });
        }
    }
}