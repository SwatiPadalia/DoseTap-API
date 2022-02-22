import express from 'express';
import validate from 'express-validation';
import * as doseController from '../controllers/caretaker/dose/dose.controller';
import * as doseValidator from '../controllers/caretaker/dose/dose.validator';

const router = express.Router();

router.post('/schedule', validate(doseValidator.scheduleDoses), doseController.scheduleDose);
router.put('/schedule/:id', validate(doseValidator.updateDoses), doseController.updateScheduledDose);
router.delete('/schedule/:id', doseController.deleteScheduledDose);
router.get('/schedule/', doseController.all);

module.exports = router;
