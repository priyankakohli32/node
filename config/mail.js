import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const NODE_MAILER_HOST = process.env.NODE_MAILER_HOST;
const NODE_MAILER_USER = process.env.NODE_MAILER_USER;
const NODE_MAILER_PASSWORD = process.env.NODE_MAILER_PASSWORD;
const NODE_MAILER_PORT = process.env.NODE_MAILER_PORT;
export const NODE_MAILER_SENDER = process.env.NODE_MAILER_SENDER;

const mailConfig = nodemailer.createTransport({
  host: NODE_MAILER_HOST,
  port: NODE_MAILER_PORT,
  auth: {
    user: NODE_MAILER_USER,
    pass: NODE_MAILER_PASSWORD,
  },
});

export default mailConfig;
