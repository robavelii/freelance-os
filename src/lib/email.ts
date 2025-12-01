import { Resend } from 'resend';
import nodemailer from 'nodemailer';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

export async function sendEmail({ to, subject, html }: EmailPayload) {
  const provider = process.env.EMAIL_PROVIDER || 'resend';

  if (provider === 'smtp') {
    return sendViaSmtp({ to, subject, html });
  }

  return sendViaResend({ to, subject, html });
}

async function sendViaResend({ to, subject, html }: EmailPayload) {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'FreelanceOS <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Resend error:', error);
    return { success: false, error };
  }
}

async function sendViaSmtp({ to, subject, html }: EmailPayload) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    return { success: true, data: info };
  } catch (error) {
    console.error('SMTP error:', error);
    return { success: false, error };
  }
}
