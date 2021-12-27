import express from 'express';
import validate from 'express-validation';
import * as authController from '../controllers/auth/auth.controller';
import * as authValidator from '../controllers/auth/auth.validator';


const router = express.Router();

//= ===============================
// Public routes
//= ===============================

router.post(
  '/login',
  validate(authValidator.login),
  authController.login,
);
router.post(
  '/register',
  validate(authValidator.register),
  authController.register,
);

module.exports = router;
