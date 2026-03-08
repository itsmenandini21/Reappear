import express from 'express';

const router = express.Router();

// Mock Database for PYQs
const pyqData = [
  {
    id: 'os-it-2',
    subjectName: 'Operating Systems',
    branch: 'Information Technology',
    yearOfStudy: '2nd Year',
    semester: '4',
    papers: [
      { id: 'p1', examType: 'Mid Sem 1', examYear: '2023', professor: 'Prof. A. Sharma' },
      { id: 'p2', examType: 'Mid Sem 2', examYear: '2023', professor: 'Dr. S. Gupta' },
      { id: 'p3', examType: 'End Sem', examYear: '2022', professor: 'Prof. A. Sharma' }
    ]
  },
  {
    id: 'dsa-it-2',
    subjectName: 'Data Structures and Algorithms',
    branch: 'Information Technology',
    yearOfStudy: '2nd Year',
    semester: '3',
    papers: [
      { id: 'p4', examType: 'Mid Sem 1', examYear: '2023', professor: 'Prof. V. Kumar' },
      { id: 'p5', examType: 'End Sem', examYear: '2022', professor: 'Dr. M. Singh' }
    ]
  },
  {
    id: 'math2-ece-1',
    subjectName: 'Mathematics II',
    branch: 'Electronics',
    yearOfStudy: '1st Year',
    semester: '2',
    papers: [
      { id: 'p6', examType: 'End Sem', examYear: '2021', professor: 'Dr. R. K. Sharma' }
    ]
  }
];

// Route 1: Get ALL Subjects (For the main directory)
router.get('/', (req, res) => {
    res.json(pyqData);
});

// Route 2: Get ONE Subject's details (For the specific subject page)
router.get('/:id', (req, res) => {
    const subject = pyqData.find(s => s.id === req.params.id);
    if (subject) {
        res.json(subject);
    } else {
        res.status(404).json({ message: 'Subject not found' });
    }
});

export default router;