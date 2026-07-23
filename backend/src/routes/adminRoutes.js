const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  handleValidation,
  nameRule,
  addressRule,
  emailRule,
  passwordRule,
} = require('../middleware/validate');

router.use(authenticate, authorize('SYSTEM_ADMIN'));

router.get('/dashboard', adminController.dashboard);

router.post(
  '/users',
  [nameRule(), emailRule(), addressRule(), passwordRule()],
  handleValidation,
  adminController.addUser
);
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserDetail);

router.post(
  '/stores',
  [nameRule(), emailRule(), addressRule()],
  handleValidation,
  adminController.addStore
);
router.get('/stores', adminController.listStores);

module.exports = router;
