import Announcement from '../models/announcement.js';
import ReappearRecord from '../models/reappearRecord.js';
import sendEmail from '../utils/sendEmail.js';

export const checkNoticeDeadlinesAndEmail = async () => {
    try {
        console.log("Running Daily Notice Deadline Checker Cron Job...");
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);

        const currentDayStart = new Date(now);
        currentDayStart.setHours(0, 0, 0, 0);

        // Find Academic announcements where deadline falls exactly within tomorrow and haven't been emailed yet!
        const endingNotices = await Announcement.find({
            category: 'Academic',
            reminderSent: false,
            deadline: {
                $gte: currentDayStart,
                $lte: tomorrow
            }
        }).populate('subject');

        if (endingNotices.length === 0) {
            console.log("No academic notices with deadline tomorrow.");
            return;
        }

        for (let notice of endingNotices) {
            // Check if notice has a subject linked
            if (!notice.subject) {
                console.log(`Notice "${notice.title}" has a deadline tomorrow but no subject linked. Skipping emails.`);
                continue;
            }

            // Find students who have NOT paid fees for this SPECIFIC subject
            const unpaidRecords = await ReappearRecord.find({
                subject: notice.subject._id,
                feesPaid: false
            }).populate('student', 'name email rollNumber');

            for (let record of unpaidRecords) {
                if (!record.student || !record.student.email) continue;
                
                const htmlMessage = `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
                        <h2 style="color: #ff2600;">Final Reminder: Deadline Approaching!</h2>
                        <p>Dear ${record.student.name},</p>
                        <p>This is a system-generated reminder regarding the recent notice: <b>${notice.title}</b></p>
                        <p>You have not yet completed the reappear application or fee payment for <b>${notice.subject.subjectName} (${notice.subject.subjectCode})</b>.</p>
                        <p style="color: #ff2600; font-weight: bold;">The final date to apply is: ${new Date(notice.deadline).toLocaleDateString()}</p>
                        <p>If you fail to submit by the deadline, you will not be allowed to sit for the examination.</p>
                        <a href="https://reappear.vercel.app/login" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 10px;">Login to Portal</a>
                    </div>
                </div>`;

                await sendEmail(record.student.email, `URGENT: Reappear Application Deadline Tomorrow - ${notice.subject.subjectCode}`, htmlMessage);
                console.log(`Sent auto reminder email to: ${record.student.email} for subject ${notice.subject.subjectCode}`);
            }
            
            // Mark the notice as officially sent so it NEVER repeats regardless of server restarts
            notice.reminderSent = true;
            await notice.save();
        }
        console.log("Notice Deadline Cron job complete.");
    } catch (error) {
        console.error("Notice Deadline Cron Job Error:", error);
    }
};

export const cleanupExpiredNotices = async () => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Delete academic notices where the deadline is STRICTLY BEFORE today
        const result = await Announcement.deleteMany({
            category: 'Academic',
            deadline: { $lt: todayStart }
        });
        
        if (result.deletedCount > 0) {
            console.log(`Cleaned up ${result.deletedCount} expired academic notices.`);
        } else {
            console.log("No expired academic notices to clean up.");
        }
    } catch (error) {
        console.error("Cleanup expired notices error:", error);
    }
};

export const startNoticeCronJob = () => {
    setTimeout(() => {
        checkNoticeDeadlinesAndEmail();
        cleanupExpiredNotices();
    }, 15000); 
    setInterval(() => {
        checkNoticeDeadlinesAndEmail();
        cleanupExpiredNotices();
    }, 24 * 60 * 60 * 1000);
};
