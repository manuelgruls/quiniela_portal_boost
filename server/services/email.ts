import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

interface EmailParams {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}

// Direct file logging to bypass cPanel/Passenger console swallowing
const LOG_FILE = path.join(process.cwd(), 'email-debug.log');

export class EmailService {
  // Public log method so other services (like storage) can write to the same debug file
  static log(message: string, isError: boolean = false) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${isError ? 'ERROR' : 'INFO'}: ${message}\n`;

    try {
      fs.appendFileSync(LOG_FILE, logLine);
      if (isError) console.error(logLine.trim());
      else console.log(logLine.trim());
    } catch (err) {
      console.error("CRITICAL: Failed to write to email-debug.log", err);
    }
  }

  private static createTransporter() {
    try {
      const port = parseInt(process.env.SMTP_PORT || '587');
      let secure = port === 465;

      if (process.env.SMTP_SECURE !== undefined) {
        const explicitSecure = process.env.SMTP_SECURE.toLowerCase() === 'true';
        if ((port === 465 && !explicitSecure) || (port === 587 && explicitSecure)) {
          this.log(`WARN: Port/secure mismatch. Auto-correcting secure setting for port ${port}`);
          secure = port === 465;
        } else {
          secure = explicitSecure;
        }
      }

      this.log(`Configuring Transporter - Host: ${process.env.SMTP_HOST}, Port: ${port}, Secure: ${secure}, User: ${process.env.SMTP_USER}`);

      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
          ciphers: 'SSLv3'
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        debug: true,
        logger: false
      });
    } catch (error: any) {
      this.log(`Failed to create transporter: ${error.message}`, true);
      throw error;
    }
  }

  static async sendEmail(params: EmailParams): Promise<boolean> {
    this.log(`Start sendEmail to: ${params.to}`);

    if (!process.env.SMTP_HOST) {
      this.log('ERROR: SMTP_HOST env variable is missing', true);
      return false;
    }

    try {
      const transporter = this.createTransporter();

      const fromName = process.env.FROM_NAME || 'Portal BOOST';
      const fromEmail = process.env.FROM_EMAIL || params.from || 'noreply@example.com';
      const fromAddress = `"${fromName}" <${fromEmail}>`;

      this.log(`Sending mail from ${fromAddress} to ${params.to}`);

      const info = await transporter.sendMail({
        from: fromAddress,
        to: params.to,
        subject: params.subject,
        text: params.text || '',
        html: params.html,
      });

      this.log(`Email sent successfully! Message ID: ${info.messageId}`);
      return true;
    } catch (error: any) {
      this.log(`SENDING FAILED: ${error.message}`, true);
      return false;
    }
  }

  static async sendUserInvitation(email: string, fullName: string, temporaryPassword: string): Promise<boolean> {
    const baseUrl = (process.env.APP_URL || 'http://localhost:5000').replace(/\/$/, '');
    const loginUrl = `${baseUrl}/login`;
    const subject = 'Bienvenido a Portal BOOST - Configura tu cuenta';

    const html = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${baseUrl}/logo.png" alt="Portal BOOST" style="height: 60px; width: auto; margin-bottom: 16px; object-fit: contain;">
          <h1 style="color: #1a1a1a; margin: 0;">Portal BOOST</h1>
        </div>
        
        <h2 style="color: #333;">¡Hola ${fullName}!</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Se ha creado una cuenta para ti en Portal BOOST. Para completar la configuración de tu cuenta, 
          sigue estos pasos:
        </p>
        
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; color: #333;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0; color: #333;"><strong>Contraseña temporal:</strong> <code style="background: #e9ecef; padding: 2px 6px; border-radius: 4px;">${temporaryPassword}</code></p>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          <strong>Importante:</strong> Deberás cambiar tu contraseña al iniciar sesión por primera vez.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" 
             style="background: #009688; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Acceder a Portal BOOST
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; text-align: center;">
          Si tienes problemas para acceder, contacta al administrador del sistema.
        </p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  static async sendPasswordReset(email: string, resetToken: string): Promise<boolean> {
    const baseUrl = (process.env.APP_URL || 'http://localhost:5000').replace(/\/$/, '');
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    const subject = 'Restablecer contraseña - Portal BOOST';

    const html = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${baseUrl}/logo.png" alt="Portal BOOST" style="height: 60px; width: auto; margin-bottom: 16px; object-fit: contain;">
          <h1 style="color: #1a1a1a; margin: 0;">Portal BOOST</h1>
        </div>
        
        <h2 style="color: #333;">Restablecer contraseña</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #009688; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Restablecer contraseña
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6; font-size: 14px;">
          Si no solicitaste este cambio, puedes ignorar este email.
        </p>
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          Portal BOOST - Gestión de Dashboards Empresariales
        </p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, html });
  }
}
