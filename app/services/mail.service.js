import {createTransport } from 'nodemailer';
import { mail } from '../../config/email.js';

const transporter = createTransport({
    host: mail.host,
    port: mail.port,
    // secure: mail.security,
    auth: {
        user: mail.username,
        pass: mail.password,
    }
});

export default transporter;