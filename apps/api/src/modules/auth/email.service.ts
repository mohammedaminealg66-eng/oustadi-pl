import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend initialized');
    } else {
      this.logger.warn('Resend not configured — emails will be logged only');
    }
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const url = `${process.env.WEB_URL || 'http://localhost:3000'}/reset-password/${token}`;
    await this.deliver({
      to: email,
      subject: 'Reset your password — Oustadi',
      title: 'Reset your password',
      preheader: 'Click below to reset your password. Link expires in 30 minutes.',
      instructions: 'You requested a password reset. Click the button below to set a new password.',
      cta: { text: 'Reset Password', url },
      footerNote: 'If you did not request this, please ignore this email.',
    });
  }

  async sendVerification(email: string, token: string): Promise<void> {
    const url = `${process.env.WEB_URL || 'http://localhost:3000'}/verify-email/${token}`;
    await this.deliver({
      to: email,
      subject: 'Verify your email — Oustadi',
      title: 'Welcome to Oustadi!',
      preheader: 'Click below to verify your email address.',
      instructions: 'Please verify your email address by clicking the button below.',
      cta: { text: 'Verify Email', url },
      footerNote: 'If you did not create an account, please ignore this email.',
    });
  }

  private async deliver(opts: {
    to: string;
    subject: string;
    title: string;
    preheader: string;
    instructions: string;
    cta: { text: string; url: string };
    footerNote: string;
  }): Promise<void> {
    if (!this.resend) {
      this.logger.log(`[EMAIL] To: ${opts.to} | Subject: ${opts.subject}`);
      return;
    }
    const { error } = await this.resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@oustadi.tech',
      to: opts.to,
      subject: opts.subject,
      html: this.template(opts),
    });
    if (error) {
      this.logger.error(`Resend failed for ${opts.to}: ${error.message}`);
      return;
    }
    this.logger.log(`[EMAIL] To: ${opts.to} | Subject: ${opts.subject} | Sent via Resend`);
  }

  private template(opts: {
    title: string;
    preheader: string;
    instructions: string;
    cta: { text: string; url: string };
    footerNote: string;
  }): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif">
<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${opts.preheader}</div>
<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%">
<tr><td style="padding:24px 16px">
  <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;max-width:480px;width:100%;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.04)">
    <!-- header -->
    <tr><td style="padding:36px 32px 0;text-align:center">
      <span style="font-size:22px;font-weight:700;color:#1e293b;letter-spacing:-.5px">Oustadi</span>
    </td></tr>
    <!-- title -->
    <tr><td style="padding:20px 32px 0">
      <h1 style="margin:0;font-size:22px;font-weight:600;color:#1e293b;text-align:center">${opts.title}</h1>
    </td></tr>
    <!-- body -->
    <tr><td style="padding:12px 32px 0;font-size:15px;line-height:1.6;color:#475569">
      <p style="margin:0">${opts.instructions}</p>
    </td></tr>
    <!-- cta button -->
    <tr><td style="padding:24px 32px 0;text-align:center">
      <a href="${opts.cta.url}" style="display:inline-block;background-color:#2563eb;color:#ffffff;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;line-height:1">${opts.cta.text}</a>
    </td></tr>
    <!-- fallback link -->
    <tr><td style="padding:14px 32px 0;font-size:13px;color:#94a3b8;text-align:center">
      <p style="margin:0">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="margin:6px 0 0;word-break:break-all"><a href="${opts.cta.url}" style="color:#2563eb;text-decoration:underline;font-size:13px">${opts.cta.url}</a></p>
    </td></tr>
    <!-- footer -->
    <tr><td style="padding:24px 32px 28px;border-top:1px solid #e2e8f0;margin-top:24px;font-size:13px;color:#94a3b8;text-align:center">
      <p style="margin:0 0 4px">${opts.footerNote}</p>
      <p style="margin:0">&copy; ${new Date().getFullYear()} Oustadi. All rights reserved.</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
  }
}
