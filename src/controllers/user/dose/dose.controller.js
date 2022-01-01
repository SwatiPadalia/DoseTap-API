import { errorResponse, successResponse } from '../../../helpers';
const { Op } = require('sequelize');
const { ScheduleDose } = require('../../../models');


export const scheduleDose = async (req, res) => {
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

      const doseDeleted = await ScheduleDose.create(payload);
    });

    return successResponse(req, res, {});
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
};


export const updateScheduledDose = async (req, res) => {
  try {
    const { userId: patient_id } = req.user;
    const id = req.params.id;
    const {
      medicine_id,
      slot_id,
      time,
      days,
      count } = req.body;

    const dose = await ScheduleDose.findOne({ where: { [Op.and]: [{ patient_id }, { id }] } });
    if (!dose)
      throw new Error('Dose do not exist');

    const payload = {
      id,
      patient_id,
      medicine_id,
      slot_id,
      time,
      days,
      count
    }

    const updatdDose = await ScheduleDose.update(payload, { where: { id, patient_id } });
    return successResponse(req, res, {});
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
};


export const deleteScheduledDose = async (req, res) => {
  try {
    const id = req.params.id;
    const dose = await ScheduleDose.findOne({ where: { id } });
    if (!dose)
      throw new Error('Dose do not exist');

    const deletedDose = await ScheduleDose.destroy({
      where: {
        id
      }
    })
    return successResponse(req, res, {});
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
};