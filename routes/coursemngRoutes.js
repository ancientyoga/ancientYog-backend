// coursemngRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/coursemngController');

router.get('/', courseController.getAllCourses);
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

module.exports = router;
