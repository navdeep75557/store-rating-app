const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const ratingController = require('../controllers/ratingController');
const { authenticate, authorize } = require('../middleware/auth');
const { handleValidation, ratingRule } = require('../middleware/validate');

// Normal User: browse stores with their own rating shown alongside overall rating
router.get('/', authenticate, authorize('NORMAL_USER'), storeController.listStoresForUser);

// Normal User: submit / modify a rating
router.post(
  '/ratings',
  authenticate,
  authorize('NORMAL_USER'),
  [ratingRule()],
  handleValidation,
  ratingController.submitRating
);
router.put(
  '/ratings/:storeId',
  authenticate,
  authorize('NORMAL_USER'),
  [ratingRule()],
  handleValidation,
  ratingController.updateRating
);

module.exports = router;
