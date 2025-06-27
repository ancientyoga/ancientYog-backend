const express = require("express");
const router = express.Router();

const {
  getCourses,
  getCourseById,
  checkEnrollment,
  initPayment,
  verifyPayment,
  addCourse,
  updateCourse,
  deleteCourse,
  getCourseBySlug,
} = require("../controllers/courseController");

// ✅ Get all courses
router.get("/", getCourses);

// ✅ Get single course by ID
router.get("/:id", getCourseById);

// ✅ Check if user is enrolled in a course
// Example: /api/courses/3/is-enrolled?userEmail=example@example.com
router.get("/:id/is-enrolled", checkEnrollment);

// ✅ Get course by slug (SEO-friendly URL)
router.get("/slug/:slug", getCourseBySlug);

// ✅ Create a new course
router.post("/", addCourse);

// ✅ Update an existing course
router.put("/:id", updateCourse);

// ✅ Delete a course
router.delete("/:id", deleteCourse);

// ✅ Initialize payment for course
router.post("/init-payment", initPayment);

// ✅ Verify payment and store in purchases table
router.post("/verify-payment", verifyPayment);

module.exports = router;
