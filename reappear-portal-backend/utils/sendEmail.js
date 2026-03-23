import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    // You can swap these out for your real production SMTP service (SendGrid, Mailgun, AWS SES)
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Connection pooling for better performance
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 10 // 10 emails per second
});

const sendEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Re-throw to allow caller to handle
    }
};

export default sendEmail;
