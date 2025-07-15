import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { ConfigService } from '@nestjs/config';

/**
 * Service to send alerts to users
 */
@Injectable()
export class EmailerService {
  private transporter: any;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const mail_support = this.configService.get<string>('MAIL_SUPPORT');
    if (!region || !mail_support) {
      throw new Error('AWS_REGION or MAIL_SUPPORT is not defined in the environment variables');
    }
    const sesClient = new SESv2Client({ region: process.env['AWS_REGION'] });
    this.transporter = nodemailer.createTransport({
        SES: { sesClient, SendEmailCommand },
    });
  }

  async sendEmail(toEmail: string, subject: string, htmlContent: any) {
    const mailOptions = {
      from: process.env['MAIL_SUPPORT'], // Email expéditeur
      to: toEmail, // Destinataire
      subject: subject, // Sujet du mail
      html: htmlContent, // Contenu HTML du mail
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email :", error);
    }
  }

  async sendConfirmationMail(mail: string, url: string) {
    const mailOptions = {
      from: 'bourgad.noreply@gmail.com', // Email expéditeur
      to: mail, // Destinataire
      subject: 'Confirmez votre adresse mail', // Sujet du mail
      html: `<p>Veuillez confirmer votre adresse email en cliquant sur le lien suivant :</p>
             <a href="${url}">Confirmer mon adresse email</a>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email :", error);
    }
  }

  async sendPasswordReinitialization(mail: string, url: string) {
    const mailOptions = {
      from: 'bourgad.noreply@gmail.com', // Email expéditeur
      to: mail, // Destinataire
      subject: 'Réinitialisez votre mot de passe', // Sujet du mail
      html: `<p>Veuillez réinitialiser votre mot de passe en cliquant sur le lien suivant :</p>
             <a href="${url}">Réinitialiser mon mot de passe</a>
             <p>Vous n'êtes pas l'auteur de cette ré-initialisation ? Merci de ne pas tenir compte de cet email.</p>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email :", error);
    }
  }
}
