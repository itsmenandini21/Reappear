import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    const examData = {
        upcoming: [
            { id: 1, examName: 'Mid Sem - 2', subject: 'Operating Systems', faculty: 'Prof. A. Sharma', date: '20 March 2026', time: '10:00 AM', room: '101', syllabus: 'Process Management, Threads, CPU Scheduling, Deadlocks.' },
            { id: 2, examName: 'Mid Sem - 2', subject: 'Database Management Systems', faculty: 'Dr. S. Gupta', date: '22 March 2026', time: '02:00 PM', room: '104', syllabus: 'Relational Model, SQL Queries, Normalization, ACID Properties.' },
            { id: 3, examName: 'Mid Sem - 2', subject: 'Computer Networks', faculty: 'Prof. R. Verma', date: '24 March 2026', time: '10:00 AM', room: '201', syllabus: 'OSI Model, TCP/IP Suite, Routing Algorithms, Network Security.' },
        ],
        results: [
            { id: 4, examName: 'Mid Sem - 1', subject: 'Computer Architecture', faculty: 'Dr. M. Singh', marks: 24, total: 30 },
            { id: 5, examName: 'End Sem', subject: 'Data Structures and Algorithms', faculty: 'Prof. V. Kumar', marks: 92, total: 100 },
        ]
    };

    res.json(examData);
});

export default router;