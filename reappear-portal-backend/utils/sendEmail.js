import { emailQueue } from "../config/queue.js";

const sendEmail = async (to, subject, htmlContent) => {
  try {
    await emailQueue.add("sendEmail", {
      to,
      subject,
      html: htmlContent,
    }, {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 500,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    console.log("Email job added to queue for:", to);
    return true;
  } catch (error) {
    console.error("Error adding email to queue:", error);
    throw error;
  }
};

export default sendEmail;
