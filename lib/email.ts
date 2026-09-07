import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@eve-chat.com",
      ...options,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export async function sendVerificationEmail(
  email: string,
  verificationCode: string,
): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?code=${verificationCode}&email=${encodeURIComponent(email)}`;

  await sendEmail({
    to: email,
    subject: "Verify your email - eve Chat",
    html: `
      <h2>Email Verification</h2>
      <p>Click the link below to verify your email address:</p>
      <p>
        <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
    `,
    text: `Verify your email by visiting: ${verificationUrl}`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetCode: string,
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?code=${resetCode}&email=${encodeURIComponent(email)}`;

  await sendEmail({
    to: email,
    subject: "Reset your password - eve Chat",
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <p>
        <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    text: `Reset your password by visiting: ${resetUrl}`,
  });
}

export async function sendWelcomeEmail(name: string, email: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: "Welcome to eve Chat!",
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Thank you for joining eve Chat. We're excited to have you on board.</p>
      <p>You can now:</p>
      <ul>
        <li>Start chatting with our AI assistant</li>
        <li>Upload and manage media files</li>
        <li>Collaborate with team members</li>
      </ul>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Get Started
        </a>
      </p>
    `,
    text: "Welcome to eve Chat! Get started by visiting our website.",
  });
}
