import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  async sendMail(
    email: string,
    subject: string,
    text: string,
    html?: any,
  ): Promise<string | undefined | null> {
    try {
      const transporter = nodemailer.createTransport({
        host: `${process.env.MAIL_HOST}`,
        port: Number(process.env.MAIL_PORT),
        secure: false,
        requireTLS: true,
        // service: 'gmail',

        auth: {
          user: `${process.env.MAIL_USER}`,
          pass: `${process.env.MAIL_PASSWORD}`,
        },
        tls: { ciphers: 'SSLv3' },
      });

      const message = {
        from: `${process.env.MAIL_USER}`,
        to: email,
        subject,
        text,
        html,
      };

      const res = await transporter.sendMail(message);
      return res?.messageId;
    } catch (err) {
      console.log(err);
    }
  }
}
