import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

/**
 * Service to send alerts to users
 */
@Injectable()
export class EmailerService {
  private sesClient: any;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const mail_support = this.configService.get<string>('MAIL_SUPPORT');
    if (!region || !mail_support) {
      throw new Error('AWS_REGION or MAIL_SUPPORT is not defined in the environment variables');
    }
    const accessKeyId = process.env['AWS_ACCESS_KEY_ID'];
    const secretAccessKey = process.env['AWS_SECRET_ACCESS_KEY'];
    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY is not defined in the environment variables');
    }
    this.sesClient = new SESClient({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
  }

  async sendEmail(toEmail: string, subject: string, htmlContent: any) {

    const params = {
      Destination: {
        ToAddresses: [toEmail],
      },
      Message: {
        Body: {
          Html: { Data: htmlContent },
        },
        Subject: { Data: subject },
      },
      Source: process.env['MAIL_SUPPORT'], // Remplacez par votre email vérifié
    };

    try {
      const command = new SendEmailCommand(params);
      const response = await this.sesClient.send(command);
      return response;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendConfirmationMail(mail: string, url: string) {
    const params = {
      Destination: {
        ToAddresses: [mail],
      },
      Message: {
        Body: {
          Html: { Data: `<p>Veuillez confirmer votre adresse email en cliquant sur le lien suivant :</p>
            <a href="${url}">Confirmer mon adresse email</a>` },
        },
        Subject: { Data: 'Confirmez votre adresse mail' },
      },
      Source: process.env['MAIL_SUPPORT'], // Remplacez par votre email vérifié
    };

    try {
      const command = new SendEmailCommand(params);
      const response = await this.sesClient.send(command);
      return response;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendPasswordReinitialization(mail: string, url: string) {
      const params = {
      Destination: {
        ToAddresses: [mail],
      },
      Message: {
        Body: {
          Html: { Data: `<p>Veuillez réinitialiser votre mot de passe en cliquant sur le lien suivant :</p>
          <a href="${url}">Réinitialiser mon mot de passe</a>
          <p>Vous n'êtes pas l'auteur de cette ré-initialisation ? Merci de ne pas tenir compte de cet email.</p>` },
        },
        Subject: { Data: 'Réinitialisez votre mot de passe' },
      },
      Source: process.env['MAIL_SUPPORT'], // Remplacez par votre email vérifié
    };

    try {
      const command = new SendEmailCommand(params);
      const response = await this.sesClient.send(command);
      return response;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
