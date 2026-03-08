import express from 'express';

const router = express.Router();

// When the frontend hits GET /api/subjects, run this function
router.get('/', (req, res) => {
    
    // Sending the hardcoded data from the SERVER
    const mySubjects = [
        { 
            id: 1, 
            name: 'Data Structures and Algorithms', 
            desc: 'Optimized solution provider for LC 955.',
            status: 'unfilled', 
            lastDate: '15 April 2026'
        },
        { 
            id: 2, 
            name: 'Computer Architecture', 
            desc: 'Core architecture concepts.',
            status: 'pending', 
            lastDate: null
        },
        { 
            id: 3, 
            name: 'Object Oriented Programming', 
            desc: 'Advanced OOP principles.',
            status: 'cleared', 
            lastDate: null
        },
        { 
            id: 4, 
            name: 'Analog Electronics', 
            desc: 'Basic circuits and systems.',
            status: 'cleared', 
            lastDate: null
        }
    ];

    // Send the data back to Next.js as JSON
    res.json(mySubjects);
});

export default router;
