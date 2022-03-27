
import express from 'express';
import * as adherenceController from '../controllers/doctor/adherence/adherence.controller';
import * as dashboardController from '../controllers/doctor/dashboard/dashboard.controller';
import * as userController from '../controllers/doctor/user/user.controller';
import * as doseController from '../controllers/doctor/dose/dose.controller';

const router = express.Router();

//Dashboard
router.get('/dashboard', dashboardController.all);

router.get('/adherence', adherenceController.adherenceData)
router.get('/medicine-adherence', adherenceController.medicineAdherenceData)
router.get('/users', userController.all)


router.get('/caretaker-mapping', userController.caretakerMapping);

router.get('/patient/:id/dose', doseController.allMedicine);


module.exports = router;