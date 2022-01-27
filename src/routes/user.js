import express from 'express';
import validate from 'express-validation';
import * as alarmController from '../controllers/user/alarm/alarm.controller';
import * as alarmValidator from '../controllers/user/alarm/alarm.validator';
import * as doseController from '../controllers/user/dose/dose.controller';
import * as doseValidator from '../controllers/user/dose/dose.validator';
import * as feedController from "../controllers/user/feed/feed.controller";
import * as medicineController from '../controllers/user/medicine/medicine.controller';
import * as medicineValidator from '../controllers/user/medicine/medicine.validator';
import * as slotController from '../controllers/user/slot/slot.controller';
import * as userSlotController from '../controllers/user/user-slot/user-slot.controller';
import * as userSlotValidator from '../controllers/user/user-slot/user-slot.validator';
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

router.get('/medicines', medicineController.all);
router.get('/medicine/:id', medicineController.findById);
router.post('/medicine', validate(medicineValidator.create), medicineController.create);
router.put('/medicine/:id', validate(medicineValidator.update), medicineController.update);
router.put('/medicine/:id/status', medicineController.statusUpdate);

router.post('/schedule', validate(doseValidator.scheduleDoses), doseController.scheduleDose);
router.put('/schedule/:id', validate(doseValidator.updateDoses), doseController.updateScheduledDose);
router.delete('/schedule/:id', doseController.deleteScheduledDose);
router.get('/schedule/', doseController.all);

router.post('/user-slot', validate(userSlotValidator.create), userSlotController.create);
router.get('/user-slot', userSlotController.all);

router.get('/slots', slotController.all);

router.get('/feeds', feedController.all);

router.post('/alarm', validate(alarmValidator.createOrUpdate), alarmController.createOrUpdate);

module.exports = router;
