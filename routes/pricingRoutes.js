// ✅ backend/routes/pricingRoutes.js
const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');

router.get('/', pricingController.getAllPlans);
router.post('/', pricingController.createPlan);
router.put('/:id', pricingController.updatePlan);
router.delete('/:id', pricingController.deletePlan);

module.exports = router;