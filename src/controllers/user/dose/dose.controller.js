import { errorResponse, successResponse } from '../../../helpers';
const { Op } = require('sequelize');
const { ScheduleDose } = require('../../../models');


export const scheduleDose = async (req, res) => {
  console.log("logger");
  try {
    const { userId: patient_id } = req.user;
    const scheduleArray = req.body.data;
    scheduleArray.map(async data => {
      const {
        medicine_id,
        slot_id,
        time,
        days,
        count } = data;

      const payload = {
        patient_id,
        medicine_id,
        slot_id,
        time,
        days,
        count
      }

      const dose = await ScheduleDose.create(payload);
    });

    return successResponse(req, res, {});
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
};