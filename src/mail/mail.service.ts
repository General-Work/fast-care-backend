import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  async sendMail(email: string, subject: string, text: string): Promise<void> {
    try {
      // Create a nodemailer transporter
      const transporter = nodemailer.createTransport({
        // Replace the SMTP configuration with your email provider details
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: 'leaveapp@ugmc.ug.edu.gh',
          pass: 'Genesis1:1',
        },
        tls: { ciphers: 'SSLv3' },
      });

      // Define the email message
      const message = {
        from: 'leaveapp@ugmc.ug.edu.gh', // Replace with your email address
        to: email,
        subject,
        text,
      };

      // Send the email
      await transporter.sendMail(message);
    } catch (err) {
      console.log(err);
    }
  }
}
