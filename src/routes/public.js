import express from 'express';
import validate from 'express-validation';
import * as authController from '../controllers/auth/auth.controller';
import * as authValidator from '../controllers/auth/auth.validator';
import * as commonController from '../controllers/common/common.controller';
import * as commonValidator from '../controllers/common/common.validator';

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

router.post(
  '/forgot-password',
  validate(authValidator.forgotPassword),
  authController.forgotPassword,
);

router.get('/reset/:token', authController.resetTokenGet);
router.post('/reset/:token', validate(authValidator.resetPassword), authController.resetTokenPost);

router.get('/dosetap-documents', commonController.getDoseTapDocuments)

router.post(
  '/support',
  commonController.supportMail,
);


router.post('/send-otp', validate(commonValidator.sendOTP), commonController.sendOTP);
router.post('/verify-otp', validate(commonValidator.verifyOTP), commonController.verifyOTP);
module.exports = router;
