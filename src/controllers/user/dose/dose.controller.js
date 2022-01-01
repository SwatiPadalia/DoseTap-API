import { errorResponse, successResponse } from '../../../helpers';
const { Op } = require('sequelize')

export const scheduleDose = async (req, res) => {
  console.log("logger");
  try {
    const { userId } = req.user;
    const scheduleArray = req.body.data;
    scheduleArray.map(data => {
      const { patient_id,
        medicine_id,
        slot_id,
        time,
        days,
        count } = data;
      
        

    });

    return successResponse(req, res, {});
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};