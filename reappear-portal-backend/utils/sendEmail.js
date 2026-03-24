import sgMail from "@sendgrid/mail";

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    if (!sendgridApiKey) {
      console.error("Missing SENDGRID_API_KEY in backend .env");
      return false; 
    }
    sgMail.setApiKey(sendgridApiKey);

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      html: htmlContent,
    };

    const response = await sgMail.send(msg);
    console.log(`[sendEmail] Successfully sent email natively to ${to}`);
    return response;
  } catch (error) {
    console.error("[sendEmail] SendGrid error:", error.response?.body || error);
    throw error;
  }
};

export default sendEmail;
