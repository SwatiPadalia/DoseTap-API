import { errorResponse, successResponse } from "../../../helpers";
import {
  Device,
  DeviceUserMapping,
  Firmwares,
  ScheduleDose,
  UserAlarm,
  UserSlot,
} from "../../../models";
const { Op } = require("sequelize");

export const resetDevice = async (req, res) => {
  try {
    const { userId: patient_id } = req.user;

    await UserAlarm.destroy({
      where: {
        user_id: patient_id,
      },
    });

    await UserSlot.destroy({
      where: {
        user_id: patient_id,
      },
    });

    await ScheduleDose.destroy({
      where: {
        patient_id: patient_id,
      },
    });

    return successResponse(req, res, {});
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const otaUpdate = async (req, res) => {
  try {
    const { userId: patient_id } = req.user;

    const deviceMappings = await DeviceUserMapping.findOne({
      where: {
        patient_id,
      },
      include: [
        {
          model: Device,
          as: "device",
        },
      ],
      order: [["id", "DESC"]],
    });

    const firmware = await Firmwares.findOne({
      where: {
        status: true,
      },
      order: [["id", "DESC"]],
    });

    if (!firmware) {
      return successResponse(req, res, {
        userFirmwareVersion: deviceMappings.device.firmwareVersion,
        lastestFirmwareVersion: deviceMappings.device.firmwareVersion,
        otpUpdate: false,
        fileUrl: "",
      });
    }

    let otpUpdate = false;

    const userFirmWareVersion = +deviceMappings.device.firmwareVersion
      .split(".")
      .join("");
    const lastestFirmwareVersion = +firmware.version.split(".").join("");

    if (userFirmWareVersion < lastestFirmwareVersion) otpUpdate = true;

    return successResponse(req, res, {
      userFirmwareVersion: deviceMappings.device.firmwareVersion,
      lastestFirmwareVersion: firmware.version,
      otpUpdate,
      fileUrl: firmware.fileUrl,
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
