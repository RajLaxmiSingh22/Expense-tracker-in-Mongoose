import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      secure: true,
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.EMAIL,  // My email address
        pass: process.env.PASSWORD,  // My email password
      },
    });
  }

  async sendEmail(to, subject, html) {
    // No Gmail credentials in .env (local dev): print the email instead of failing
    if (!process.env.EMAIL || !process.env.PASSWORD) {
      console.log(`[DEV EMAIL] EMAIL/PASSWORD not set in .env, so not sending.\nTo: ${to}\nSubject: ${subject}\n${html}`);
      return { dev: true };
    }

    const mailOptions = {
      to,
      subject,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

export default new EmailService();
