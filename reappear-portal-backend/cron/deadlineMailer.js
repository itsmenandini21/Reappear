import Subject from '../models/subject.js';
import ReappearRecord from '../models/reappearRecord.js';
import sendEmail from '../utils/sendEmail.js';

export const checkDeadlinesAndEmail = async () => {
    try {
        console.log("Running Daily Deadline Checker Cron Job...");
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);

        const currentDayStart = new Date(now);
        currentDayStart.setHours(0, 0, 0, 0);

        // Find subjects where lastDateToApply falls exactly within tomorrow
        const endingSubjects = await Subject.find({
            lastDateToApply: {
                $gte: currentDayStart,
                $lte: tomorrow
            }
        });

        if (endingSubjects.length === 0) {
            console.log("No subjects ending tomorrow.");
            return;
        }

        for (let subject of endingSubjects) {
            // Find students who have NOT paid fees for this subject
            const unpaidRecords = await ReappearRecord.find({
                subject: subject._id,
                feesPaid: false
            }).populate('student', 'name email rollNumber');

            for (let record of unpaidRecords) {
                if (!record.student || !record.student.email) continue;
                
                const htmlMessage = `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
                        <h2 style="color: #ff2600;">Final Reminder: Deadline Approaching!</h2>
                        <p>Dear ${record.student.name},</p>
                        <p>This is a system-generated reminder that you have not yet completed the reappear application or fee payment for <b>${subject.subjectName} (${subject.subjectCode})</b>.</p>
                        <p style="color: #ff2600; font-weight: bold;">The final date to apply is: ${new Date(subject.lastDateToApply).toLocaleDateString()}</p>
                        <p>If you fail to submit by the deadline, you will not be allowed to sit for the examination.</p>
                        <a href="http://localhost:3000/login" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 10px;">Login to Portal</a>
                    </div>
                </div>`;

                await sendEmail(record.student.email, `URGENT: Reappear Application Deadline Tomorrow - ${subject.subjectCode}`, htmlMessage);
                console.log(`Sent auto reminder email to: ${record.student.email}`);
            }
        }
        console.log("Cron job complete.");
    } catch (error) {
        console.error("Cron Job Error:", error);
    }
};

export const startCronJob = () => {
    setTimeout(checkDeadlinesAndEmail, 10000); 
    setInterval(checkDeadlinesAndEmail, 24 * 60 * 60 * 1000);
};
