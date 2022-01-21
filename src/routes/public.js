import express from 'express';
import validate from 'express-validation';
import * as authController from '../controllers/auth/auth.controller';
import * as authValidator from '../controllers/auth/auth.validator';
import * as commonController from '../controllers/common.controller';


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

router.get(
  '/states',
  commonController.getStates,
);

module.exports = router;
