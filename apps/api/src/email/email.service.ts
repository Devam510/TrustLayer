import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resendApiKey: string;

  constructor(private configService: ConfigService) {
    this.resendApiKey = this.configService.get<string>('RESEND_API_KEY') || 'sk_test_resend';
    if (this.resendApiKey === 'sk_test_resend') {
      this.logger.warn('RESEND_API_KEY is not set. Using test mode (logs only).');
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      if (this.resendApiKey === 'sk_test_resend') {
        this.logger.debug(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
        return true;
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'TrustLayer <alerts@updates.trustlayer.com>',
          to,
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        this.logger.error(`Resend API error: ${JSON.stringify(err)}`);
        return false;
      }

      this.logger.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      return false;
    }
  }

  async sendTrustAlert(to: string, projectName: string, clientName: string, balance: number, buffer: number) {
    const subject = `TrustLayer Alert: Insufficient funds verified for ${projectName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
        <h2 style="color: #e11d48;">Action Required: Insufficient Client Funds</h2>
        <p>Your client <strong>${clientName}</strong> currently has verified funds of <strong>$${balance.toLocaleString()}</strong>, which is below your safety threshold of <strong>$${buffer.toLocaleString()}</strong> for the project <strong>${projectName}</strong>.</p>
        <p>Please review this alert in your TrustLayer dashboard.</p>
        <a href="https://app.trustlayer.com/dashboard/alerts" style="display: inline-block; padding: 10px 20px; background-color: #020617; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;">View Dashboard</a>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }

  async sendClientInvite(to: string, inviteUrl: string, freelancerName: string, projectName: string) {
    const subject = `Verify funding for ${projectName} on TrustLayer`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
        <h2>Funding Verification Request</h2>
        <p><strong>${freelancerName}</strong> is using TrustLayer to securely verify project funding for <strong>${projectName}</strong>.</p>
        <p>Link your bank account via Plaid. TrustLayer is a read-only proof of funds vault and cannot move money.</p>
        <a href="${inviteUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;">Securely Link Account</a>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }
}
