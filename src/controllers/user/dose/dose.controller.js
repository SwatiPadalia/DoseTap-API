import { errorResponse, successResponse } from '../../../helpers';
const { Op } = require('sequelize');
const { ScheduleDose, Medicine, User, CareTakerScheduleDose } = require('../../../models');


export const scheduleDose = async (req, res) => {
  try {
    const { userId: patient_id } = req.user;
    console.log("🚀 ~ file: dose.controller.js ~ line 9 ~ scheduleDose ~ patient_id", patient_id)
    const {
      medicine_id,
      slot_ids,
      days,
      count_morning, count_afternoon, count_evening, count_night } = req.body.data;

    const payload = {
      patient_id,
      medicine_id,
      slot_ids,
      days,
      count_morning, count_afternoon, count_evening, count_night
    }

    const doseCreated = await ScheduleDose.create(payload);


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
      slot_ids,
      days,
      count_morning, count_afternoon, count_evening, count_night } = req.body;

    const dose = await ScheduleDose.findOne({ where: { [Op.and]: [{ patient_id }, { id }] } });
    if (!dose)
      throw new Error('Dose do not exist');

    const payload = {
      slot_ids,
      days,
      count_morning, count_afternoon, count_evening, count_night
    }

    const updatedDose = await ScheduleDose.update(payload, { where: { id, patient_id } });
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

export const all = async (req, res) => {

  try {
    const { userId: patient_id } = req.user;
    const doses = await ScheduleDose.findAll({
      where: {
        patient_id
      },
      include: [{ model: Medicine, as: 'medicineDetails' }, { model: User, as: 'patientDetails' }]
    });
    return successResponse(req, res, { doses });
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
}

export const getCareTakerSchedule = async (req, res) => {

  try {
    const { userId: patient_id } = req.user;
    const doses = await CareTakerScheduleDose.findAll({
      where: {
        patient_id
      },
      include: [{ model: Medicine, as: 'medicineDetails' }, { model: User, as: 'patientDetails' }]
    });
    return successResponse(req, res, { doses });
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
}

export const acceptRejectCareTakerSchedule = async (req, res) => {
  try {
    const { userId: patient_id } = req.user;
    const { status } = req.body
    if (status) {
      //Mail that its accepted
    } else {
      //Mail that its rejected
    }

    await CareTakerScheduleDose.destroy({
      where: {
        patient_id
      }
    })

    return successResponse(req, res, "success");

  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
}