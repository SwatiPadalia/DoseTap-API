import express from 'express';
import validate from 'express-validation';
import * as doseController from '../controllers/user/dose/dose.controller';
import * as doseValidator from '../controllers/user/dose/dose.validator';
import * as userController from '../controllers/user/user.controller';
import * as userValidator from '../controllers/user/user.validator';


const router = express.Router();

//= ===============================
// API routes
//= ===============================
router.get('/me', userController.profile);
router.post('/me', validate(userValidator.update), userController.update);
router.post(
  '/changePassword',
  validate(userValidator.changePassword),
  userController.changePassword,
);

router.post('/schedule', validate(doseValidator.scheduleDoses), doseController.scheduleDose);
router.put('/schedule/:id', validate(doseValidator.updateDoses), doseController.updateScheduledDose);
router.delete('/schedule/:id', doseController.deleteScheduledDose);

module.exports = router;
