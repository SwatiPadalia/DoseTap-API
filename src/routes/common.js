import express from 'express';
import * as commonController from '../controllers/common.controller';
const router = express.Router();


router.get('/medicine/:id/adherence', commonController.report);

router.get('/medicine-adherence', commonController.medicineAdherenceData)


module.exports = router;