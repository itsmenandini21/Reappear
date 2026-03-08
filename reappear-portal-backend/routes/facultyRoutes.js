// import express from 'express';

// const router = express.Router();

// router.get('/', (req, res) => {
//     const facultyData = [
//         { id: 1, name: 'Dr. Rajesh Kumar', gender: 'M', subject: 'Data Structures', dept: 'Information Technology', phone: '+91 98765 43210' },
//         { id: 2, name: 'Prof. Sneha Sharma', gender: 'F', subject: 'Mathematics II', dept: 'Mathematics', phone: '+91 98765 43211' },
//         { id: 3, name: 'Dr. Amit Verma', gender: 'M', subject: 'Discrete Maths', dept: 'Computer Science', phone: '+91 98765 43212' },
//         { id: 4, name: 'Dr. Meera Gupta', gender: 'F', subject: 'Operating Systems', dept: 'Information Technology', phone: '+91 98765 43213' },
//         { id: 5, name: 'Prof. Vikram Singh', gender: 'M', subject: 'Database Management', dept: 'Information Technology', phone: '+91 98765 43214' },
//         { id: 6, name: 'Dr. Anjali Desai', gender: 'F', subject: 'Analog Electronics', dept: 'Electronics', phone: '+91 98765 43215' },
//     ];
    
//     res.json(facultyData);
// });

// export default router;

import express from 'express';
import { getFaculty, addFaculty, updateFaculty, deleteFaculty } from '../controllers/facultyController.js';

const router = express.Router();

// The student frontend will hit this GET route to load the cards
router.get('/', getFaculty);

// The admin frontend will hit these routes to manage the list
router.post('/', addFaculty);
router.put('/:id', updateFaculty);
router.delete('/:id', deleteFaculty);

export default router;