import express from 'express';
import validate from 'express-validation';
import * as doseController from '../controllers/caretaker/dose/dose.controller';
import * as doseValidator from '../controllers/caretaker/dose/dose.validator';
import * as patientController from '../controllers/caretaker/patient/patient.controller';
import * as userSlotController from '../controllers/caretaker/user-slot/user-slot.controller';
import * as userSlotValidator from '../controllers/caretaker/user-slot/user-slot.validator';
import * as slotController from '../controllers/user/slot/slot.controller';

const router = express.Router();

router.post('/schedule', validate(doseValidator.scheduleDoses), doseController.scheduleDose);
router.put('/schedule/:id', validate(doseValidator.updateDoses), doseController.updateScheduledDose);
router.delete('/schedule/:id', doseController.deleteScheduledDose);
router.get('/schedule/', doseController.all);


router.post('/user-slot', validate(userSlotValidator.create), userSlotController.create);
router.get('/user-slot', userSlotController.all);

router.get('/slots', slotController.all);
router.get('/tagged-patient', patientController.patientTagedToCaretaker);


module.exports = router;
