import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io';
  const port = parseInt(process.env.SMTP_PORT || '2525');
  const user = process.env.SMTP_USER || '8eb0939e4e4a8e';
  const pass = process.env.SMTP_PASS || '15473031f58dcf';

  console.log(`[SMTP CONFIG] Host: ${host}, Port: ${port}, User: ${user}`);

  transporter = nodemailer.createTransport({
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

export const sendEmail = async (options: EmailOptions): Promise<void> => {
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
  } catch (err: any) {
    console.error(`❌ [SMTP ERROR] Failed to send email to ${options.to}. Details:`, err.message || err);
    if (err.stack) {
      console.error(err.stack);
    }
  }
};
