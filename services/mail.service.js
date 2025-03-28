import mailConfig, { NODE_MAILER_SENDER } from "../config/mail.js";

class EmailService {
  static async sendEmail({ to, subject, text, html }) {
    try {
      const mailOptions = {
        from: NODE_MAILER_SENDER, // Sender address
        to, // Receiver's address
        subject, // Subject line
        text, // Plain text body
        html, // HTML body (optional)
      };

      // Send email
      const info = await mailConfig.sendMail(mailOptions);
      console.log("Email sent: ", info.messageId);
      return info.messageId;
    } catch (error) {
      console.error("Error sending email: ", error);
      throw error; // Propagate error if needed
    }
  }
}

export default EmailService;
