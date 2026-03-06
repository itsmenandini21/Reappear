import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    const peersData = [
        { 
          id: 1, name: 'Aarav Patel', rollNo: '124101', branch: 'Information Technology',
          reappears: [
            { subject: 'Data Structures', semester: '3' },
            { subject: 'Discrete Maths', semester: '4' }
          ]
        },
        { 
          id: 2, name: 'Neha Sharma', rollNo: '124105', branch: 'Computer Science',
          reappears: [
            { subject: 'Operating Systems', semester: '4' }
          ]
        },
        { 
          id: 3, name: 'Rohan Gupta', rollNo: '124112', branch: 'Electronics',
          reappears: [
            { subject: 'Analog Electronics', semester: '3' },
            { subject: 'Network Theory', semester: '4' }
          ]
        },
        { 
          id: 4, name: 'Priya Singh', rollNo: '124118', branch: 'Information Technology',
          reappears: [
            { subject: 'Operating Systems', semester: '4' },
            { subject: 'Data Structures', semester: '3' },
            { subject: 'Computer Architecture', semester: '3' }
          ]
        },
        { 
          id: 5, name: 'Karan Verma', rollNo: '124125', branch: 'Mechanical',
          reappears: [
            { subject: 'Thermodynamics', semester: '5' }
          ]
        }
      ];

    res.json(peersData);
});

export default router;