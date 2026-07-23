const { validationResult, body } = require('express-validator');

// Runs after the express-validator rules and returns a 400 with the first error if any failed
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

const nameRule = (field = 'name') =>
  body(field)
    .isLength({ min: 20, max: 60 })
    .withMessage(`${field} must be between 20 and 60 characters`);

const addressRule = (field = 'address') =>
  body(field)
    .isLength({ min: 0, max: 400 })
    .withMessage(`${field} must be at most 400 characters`);

const emailRule = (field = 'email') =>
  body(field).isEmail().withMessage('Must be a valid email address');

const passwordRule = (field = 'password') =>
  body(field)
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be 8-16 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must include at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'/`~]/)
    .withMessage('Password must include at least one special character');

const ratingRule = (field = 'rating') =>
  body(field).isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5');

module.exports = {
  handleValidation,
  nameRule,
  addressRule,
  emailRule,
  passwordRule,
  ratingRule,
};
