import express from 'express';
import validate from 'express-validation';
import * as companyController from '../controllers/admin/company/company.controller';
import * as companyValidator from '../controllers/admin/company/company.validator';
import * as deviceController from '../controllers/admin/device/device.controller';
import * as deviceValidator from '../controllers/admin/device/device.validator';
import * as feedController from '../controllers/admin/feed/feed.controller';
import * as feedValidator from '../controllers/admin/feed/feed.validator';
import * as medicineController from '../controllers/admin/medicine/medicine.controller';
import * as medicineValidator from '../controllers/admin/medicine/medicine.validator';
import * as slotController from '../controllers/admin/slot/slot.controller';
import * as slotValidator from '../controllers/admin/slot/slot.validator';
import * as userController from '../controllers/admin/user/user.controller';
import * as userValidator from '../controllers/admin/user/user.validator';



const router = express.Router();

//= ===============================
// Admin routes
//= ===============================

// User
router.get('/users', userController.all);
router.get('/user/:id', userController.findById);
router.post('/user', validate(userValidator.createUser), userController.create);
router.put('/user/:id', validate(userValidator.editUser), userController.update);
router.put('/user/:id/status', userController.statusUpdate);

// Device

router.get('/devices', deviceController.all);
router.get('/device/:id', deviceController.findById);
router.post('/device', validate(deviceValidator.createDevice), deviceController.create);
router.put('/device/:id', validate(deviceValidator.updateDevice), deviceController.update);
router.put('/device/:id/status', deviceController.statusUpdate);
router.post('/device/map', validate(deviceValidator.tagDevice), deviceController.deviceTagToCompanyDoctor);


//Company
router.get('/companies', companyController.all);
router.get('/company/:id', companyController.findById);
router.post('/company', validate(companyValidator.createCompany), companyController.create);
router.put('/company/:id', validate(companyValidator.updateCompany), companyController.update);


// Medicine

router.get('/medicines', medicineController.all);
router.get('/medicine/:id', medicineController.findById);
router.post('/medicine', validate(medicineValidator.create), medicineController.create);
router.put('/medicine/:id', validate(medicineValidator.update), medicineController.update);
router.put('/medicine/:id/status', medicineController.statusUpdate);


//Slot
router.get('/slots', slotController.all);
router.get('/slot/:id', slotController.findById);
router.post('/slot', validate(slotValidator.create), slotController.create);
router.put('/slot/:id', validate(slotValidator.update), slotController.update);

//Feed
router.get('/feeds', feedController.all);
router.get('/feed/:id', feedController.findById);
router.post('/feed', validate(feedValidator.create), feedController.create);
router.put('/feed/:id', validate(feedValidator.update), feedController.update);

module.exports = router;
