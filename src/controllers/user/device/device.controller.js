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

    let otpUpdate = false;

    const userFirmWareVersion = +deviceMappings.device.firmwareVersion
      .split(".")
      .join("");
    const lastestFirnwareVersion = +firmware.version.split(".").join("");

    if (userFirmWareVersion < lastestFirnwareVersion) otpUpdate = true;

    return successResponse(req, res, {
      userFirmWareVersion: deviceMappings.device.firmwareVersion,
      lastestFirnwareVersion: firmware.version,
      otpUpdate,
      fileUrl: firmware.fileUrl,
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
