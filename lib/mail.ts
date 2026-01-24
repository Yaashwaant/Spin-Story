import nodemailer from 'nodemailer';
import { SignJWT } from 'jose';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,      // youraddress@gmail.com
    pass: process.env.GMAIL_APP_PASS,  // 16-char App Password
  },
});

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-please-set-JWT_SECRET'
);

export async function sendVerificationEmail(to: string, code: string) {
  await transporter.sendMail({
    from: `"Spin Storey" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Verify your e-mail',
    text: `Your verification code is ${code}. It expires in 15 minutes.`,
    html: `<p>Your verification code is <strong>${code}</strong>.</p>
           <p>It expires in 15 minutes.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Spin Storey" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Reset your Spin Storey password',
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 15 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
}