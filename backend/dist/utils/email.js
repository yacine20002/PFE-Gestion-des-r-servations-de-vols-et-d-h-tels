"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
let transporter = null;
async function getTransporter() {
    if (transporter)
        return transporter;
    const host = process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io';
    const port = parseInt(process.env.SMTP_PORT || '2525');
    const user = process.env.SMTP_USER || '8eb0939e4e4a8e';
    const pass = process.env.SMTP_PASS || '15473031f58dcf';
    console.log(`[SMTP CONFIG] Host: ${host}, Port: ${port}, User: ${user}`);
    transporter = nodemailer_1.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
    });
    return transporter;
}
const sendEmail = async (options) => {
    try {
        const t = await getTransporter();
        console.log(`[SMTP INFO] Attempting to send email to: ${options.to} (Subject: "${options.subject}")`);
        await t.sendMail({
            from: '"FlightHotel Booking" <noreply@flighthotel.com>',
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
        console.log(`📧 [SMTP SUCCESS] Email sent successfully to ${options.to}: "${options.subject}"`);
    }
    catch (err) {
        console.error(`❌ [SMTP ERROR] Failed to send email to ${options.to}. Details:`, err.message || err);
        if (err.stack) {
            console.error(err.stack);
        }
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map