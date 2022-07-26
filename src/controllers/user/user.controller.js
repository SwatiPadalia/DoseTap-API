import crypto from "crypto";
import jwt from "jsonwebtoken";
import { errorResponse, successResponse } from "../../helpers";
import {
  Adherence,
  Device,
  DeviceCompanyMappings,
  DeviceUserMapping,
  User,
  UserDoctorMappings,
} from "../../models";
const { Op } = require("sequelize");
const template = require("../../mail/mailTemplate");
const mailSender = require("../../mail/sendEmail");

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
      process.env.SECRET
    );
    return successResponse(req, res, { user, token });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    console.log(req.user);
    const { userId } = req.user;
    const user = await User.scope("withSecretColumns").findOne({
      where: { id: userId },
    });

    const reqPass = crypto
      .createHash("md5")
      .update(req.body.oldPassword)
      .digest("hex");
    if (reqPass !== user.password) {
      throw new Error("Old password is incorrect");
    }

    const newPass = crypto
      .createHash("md5")
      .update(req.body.newPassword)
      .digest("hex");

    await User.update({ password: newPass }, { where: { id: user.id } });
    return successResponse(req, res, {});
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const update = async (req, res) => {
  try {
    const { userId } = req.user;
    const { firstName, lastName, gender, dob, phone, city, state } = req.body;

    const user = await User.findOne({ where: { id: userId } });
    if (!user) throw new Error("User do not exist");

    const payload = {
      firstName,
      lastName,
      gender,
      dob,
      phone,
      city,
      state,
    };
    console.log(
      "🚀 ~ file: user.controller.js ~ line 83 ~ update ~ payload",
      payload
    );
    const updated = await User.update(payload, { where: { id: userId } });
    const updatedUser = await User.findOne({ where: { id: userId } });
    return successResponse(req, res, { user: updatedUser });
  } catch (error) {
    const err = error.errors[0];
    return errorResponse(req, res, err.message);
  }
};

export const syncData = async (req, res) => {
  try {
    const { userId } = req.user;
    const lastSync = new Date();
    const { appVersion, firmwareVersion, serialNumber, device_data } = req.body;

    const user = await User.findOne({ where: { id: userId } });
    if (!user) throw new Error("User do not exist");

    await User.update({ appVersion, lastSync }, { where: { id: userId } });

    const device = await Device.findOne({
      where: {
        serialNumber,
      },
    });
    if (!device) throw new Error("Device do not exist");

    await Device.update({ firmwareVersion }, { where: { id: device.id } });

    const deviceCompanyMapping = await DeviceCompanyMappings.findOne({
      where: {
        device_id: device.id,
      },
    });

    if (!deviceCompanyMapping)
      throw new Error("Device is not mapped to a company");

    const deviceMapping = await DeviceUserMapping.findAll({
      where: {
        device_id: device.id,
        company_id: deviceCompanyMapping.company_id,
      },
      raw: true,
    });
    console.log(
      "🚀 ~ file: user.controller.js ~ line 131 ~ syncData ~ deviceMapping",
      deviceMapping
    );

    if (deviceMapping.length > 0) {
      let matched = false;

      for (let i = 0; i < deviceMapping.length; i++) {
        console.log("dm.patient_id", deviceMapping[i].patient_id);
        console.log("userId", userId);
        if (deviceMapping[i].patient_id == userId) matched = true;
      }

      console.log(
        "🚀 ~ file: user.controller.js ~ line 135 ~ syncData ~ matched",
        matched
      );

      if (matched) {
        await DeviceUserMapping.update(
          { lastSync },
          { where: { device_id: device.id, patient_id: userId } }
        );
      } else {
        var userDoctorMapping = await UserDoctorMappings.findOne({
          where: {
            patient_id: userId,
          },
        });
        await DeviceUserMapping.create({
          device_id: device.id,
          company_id: deviceCompanyMapping.company_id,
          patient_id: userId,
          doctor_id: userDoctorMapping.doctor_id,
          lastSync,
        });
      }
    } else {
      var userDoctorMapping = await UserDoctorMappings.findOne({
        where: {
          patient_id: userId,
        },
      });

      await DeviceUserMapping.create({
        device_id: device.id,
        patient_id: userId,
        doctor_id: userDoctorMapping.doctor_id,
        company_id: deviceCompanyMapping.company_id,
        lastSync,
      });
    }

    if (device_data != undefined) {
      if (device_data.length > 0) {
        console.log(" >>>>>>>>>>>", device_data);
        const splitData = device_data.replace(/\s/g, "").split(",");
        for (let i = 0; i < splitData.length; ) {
          console.log("Loop >>", i);
          console.log("length splitData[i].length >>", splitData[i + 1].length);
          if (splitData[i + 1].length != 12) {
            splitData[i + 1] = "0" + splitData[i + 1];
          }
          console.log(
            "🚀 ~ file: user.controller.js ~ line 190 ~ syncData ~ splitData",
            splitData[i + 1]
          );

          let slot_id = 1;
          const time = parseInt(
            splitData[i + 1].split(":").join("").slice(0, -8)
          );
          console.log(
            "🚀 ~ file: user.controller.js ~ line 194 ~ syncData ~ time",
            time
          );

          if (time >= 500 && time < 900) {
            slot_id = 1;
          }

          if (time >= 900 && time < 1200) {
            slot_id = 2;
          }

          if (time >= 1200 && time < 1300) {
            slot_id = 3;
          }

          if (time >= 1300 && time < 1500) {
            slot_id = 4;
          }

          if (time >= 1500 && time < 1700) {
            slot_id = 5;
          }

          if (time >= 1700 && time < 1900) {
            slot_id = 6;
          }

          if (time >= 1900 && time < 2100) {
            slot_id = 7;
          }

          if (time >= 2100 && time <= 2300) {
            slot_id = 8;
          }

          let payload = {
            patient_id: userId,
            status: splitData[i].toLowerCase() == "open" ? "Open" : "Missed",
            date:
              splitData[i + 1].substring(8, 12) +
              "-" +
              splitData[i + 1].substring(6, 8) +
              "-" +
              splitData[i + 1].substring(4, 6),
            time:
              splitData[i + 1].substring(0, 2) +
              ":" +
              splitData[i + 1].substring(2, 4) +
              ":00",
            slot_id: slot_id,
          };
          console.log(
            "🚀 ~ file: user.controller.js ~ line 198 ~ syncData ~ payload",
            payload
          );

          const isExist = await Adherence.findAll({
            where: {
              ...payload,
            },
          });
          console.log(
            "🚀 ~ file: user.controller.js ~ line 205 ~ syncData ~ isExist",
            isExist.length
          );

          if (isExist.length > 0) {
            i = i + 2;
            continue;
          }

          await Adherence.create(payload);
          i = i + 2;
        }
      }
    }

    return successResponse(req, res, {});
  } catch (error) {
    console.log(
      "🚀 ~ file: user.controller.js ~ line 164 ~ syncData ~ error",
      error
    );
    return errorResponse(req, res, error.message);
  }
};

export const inviteCaretaker = async (req, res) => {
  try {
    const { userId } = req.user;

    let { firstName, lastName, phone, email } = req.body;

    if (email != undefined) {
      const fromUser = await User.findOne({
        where: {
          id: userId,
        },
      });

      const emailParams = {
        to: firstName + " " + (lastName || ""),
        from: fromUser.firstName + " " + fromUser.lastName,
        code: fromUser.reference_code,
      };
      console.log(
        "🚀 ~ file: user.controller.js ~ line 239 ~ inviteCaretaker ~ emailParams",
        emailParams
      );

      const emailBody = template.inviteCaretakerEmail(emailParams);

      const params = {
        emailBody,
        subject: "Welcome to Dosetap",
        toEmail: email,
      };
      mailSender.sendMail(params);
    }

    return successResponse(req, res, {});
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
