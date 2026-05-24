import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const host = process.env.SMTP_HOST;
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      this.logger.warn('SMTP not configured — emails will be logged only');
    }
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const url = `${process.env.WEB_URL || 'http://localhost:3000'}/reset-password/${token}`;
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
        <h2 style="color:#2563eb">Oustadi — Reset Password</h2>
        <p>Click the button below to reset your password. This link expires in 30 minutes.</p>
        <a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Reset Password</a>
        <p style="color:#6b7280;font-size:14px">If you did not request this, ignore this email.</p>
      </div>`;
    await this.send(email, 'Oustadi — Reset Password', html);
  }

  async sendVerification(email: string, token: string): Promise<void> {
    const url = `${process.env.WEB_URL || 'http://localhost:3000'}/verify-email/${token}`;
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
        <h2 style="color:#2563eb">Oustadi — Verify Email</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Verify Email</a>
        <p style="color:#6b7280;font-size:14px">If you did not create an account, ignore this email.</p>
      </div>`;
    await this.send(email, 'Oustadi — Verify Email', html);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (this.transporter) {
      await this.transporter.sendMail({ from: process.env.SMTP_FROM || 'noreply@oustadi.ma', to, subject, html });
    }
    this.logger.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
  }
}
