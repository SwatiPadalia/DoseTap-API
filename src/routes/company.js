
import express from 'express';
import * as adherenceController from '../controllers/company/adherence/adherence.controller';
import * as dashboardController from '../controllers/company/dashboard/dashboard.controller';
import * as userController from '../controllers/company/user/user.controller';

const router = express.Router();

//Dashboard
router.get('/dashboard', dashboardController.all);
router.get('/adherence', adherenceController.adherenceData)
router.get('/medicine-adherence', adherenceController.medicineAdherenceData)
router.get('/users', userController.all)

module.exports = router;