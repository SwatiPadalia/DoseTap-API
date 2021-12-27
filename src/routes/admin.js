import express from 'express';
import validate from 'express-validation';
import * as deviceController from '../controllers/admin/device/device.controller';
import * as deviceValidator from '../controllers/admin/device/device.validator';
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

module.exports = router;
