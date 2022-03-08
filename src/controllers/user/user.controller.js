import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { errorResponse, successResponse } from '../../helpers';
import { Device, DeviceCompanyMappings, DeviceUserMapping, User, UserDoctorMappings } from '../../models';
const { Op } = require('sequelize')

export const profile = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findOne({ where: { id: userId } });
    const token = jwt.sign(
      {
        user: {
          userId: user.id,
          email: user.email,
          role: user.role,
          phone: user.phone,
          createdAt: new Date(),
        },
      },
      process.env.SECRET,
    );
    return successResponse(req, res, { user, token });
  } catch (error) {
    return errorResponse(req, res, error.messdob);
  }
};

export const changePassword = async (req, res) => {
  try {
    console.log(req.user);
    const { userId } = req.user;
    const user = await User.scope('withSecretColumns').findOne({
      where: { id: userId },
    });

    const reqPass = crypto
      .createHash('md5')
      .update(req.body.oldPassword)
      .digest('hex');
    if (reqPass !== user.password) {
      throw new Error('Old password is incorrect');
    }

    const newPass = crypto
      .createHash('md5')
      .update(req.body.newPassword)
      .digest('hex');

    await User.update({ password: newPass }, { where: { id: user.id } });
    return successResponse(req, res, {});
  } catch (error) {
    return errorResponse(req, res, error.messdob);
  }
};

export const update = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      firstName,
      lastName,
      gender,
      dob,
      phone,
      city,
      state
    } = req.body;

    const user = await User.findOne({ where: { id: userId } });
    if (!user)
      throw new Error('User do not exist');

    const payload = {
      firstName,
      lastName,
      gender,
      dob,
      phone,
      city,
      state
    }
    console.log("🚀 ~ file: user.controller.js ~ line 83 ~ update ~ payload", payload)
    const updated = await User.update(payload, { where: { id: userId } });
    const updatedUser = await User.findOne({ where: { id: userId } });
    return successResponse(req, res, { user: updatedUser });

  } catch (error) {
    const err = error.errors[0];
    return errorResponse(req, res, err.messdob);
  }
};


export const syncData = async (req, res) => {
  try {
    const { userId } = req.user;
    const lastSync = new Date();
    const {
      appVersion,
      firmwareVersion,
      serialNumber,
    } = req.body;

    const user = await User.findOne({ where: { id: userId } });
    if (!user)
      throw new Error('User do not exist');

    await User.update({ appVersion, lastSync }, { where: { id: userId } });

    const device = await Device.findOne({
      where: {
        serialNumber
      }
    })
    if (!device)
      throw new Error('Device do not exist');

    await Device.update({ firmwareVersion }, { where: { id: device.id } });

    const deviceCompanyMapping = await DeviceCompanyMappings.findOne({
      where: {
        device_id: device.id,
      }
    })

    if (!deviceCompanyMapping)
      throw new Error('Device is not Mapped do not exist');

    const deviceMapping = await DeviceUserMapping.findAll({
      where: {
        device_id: device.id,
        company_id: deviceCompanyMapping.company_id
      }
    })

    if (deviceMapping.length > 0) {
      let matched = false;
      deviceMapping.map(d => {
        if (d.patient_id == userId) matched = true;
      })

      if (matched) {
        await DeviceUserMapping.update({ lastSync }, { where: { device_id: device.id, patient_id: userId } });
      } else {
        var userDoctorMapping = await UserDoctorMappings.findOne({
          where: {
            patient_id: userId
          }
        })
        await DeviceUserMapping.create({
          device_id: device.id,
          company_id: deviceCompanyMapping.company_id,
          patient_id: userId,
          doctor_id: userDoctorMapping.doctor_id,
          lastSync
        });
      }
    }
    else {
      var userDoctorMapping = await UserDoctorMappings.findOne({
        where: {
          patient_id: userId
        }
      })

      await DeviceUserMapping.create({
        device_id: device.id,
        patient_id: userId,
        doctor_id: userDoctorMapping.doctor_id,
        company_id: deviceCompanyMapping.company_id,
        lastSync
      });
    }

    return successResponse(req, res, {});

  } catch (error) {
    console.log("🚀 ~ file: user.controller.js ~ line 164 ~ syncData ~ error", error)
    return errorResponse(req, res, error.messdob);
  }
}