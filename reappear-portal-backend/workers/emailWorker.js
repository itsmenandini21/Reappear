import { Worker } from "bullmq";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { redisConnection } from "../config/queue.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const sendgridApiKey = process.env.SENDGRID_API_KEY;
if (!sendgridApiKey) {
  console.error("Missing SENDGRID_API_KEY in backend .env");
  process.exit(1);
}

sgMail.setApiKey(sendgridApiKey);

new Worker(
  "emailQueue",
  async (job) => {
    const { to, subject, html } = job.data || {};
    console.log(`[emailWorker] Sending email jobId=${job.id} to=${to} subject=${subject}`);

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      html,
    };

    try {
      const response = await sgMail.send(msg);
      console.log(`[emailWorker] Sent email jobId=${job.id} via SendGrid`);
      return response;
    } catch (error) {
      console.error("[emailWorker] SendGrid error:", error.response?.body || error);
      throw error;
    }
  },
  {
    connection: redisConnection,
  }
);

console.log("✅ Email worker running (BullMQ → SendGrid)...");