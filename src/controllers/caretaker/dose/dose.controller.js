import { errorResponse, successResponse } from '../../../helpers';
const { Op } = require('sequelize');
const { CareTakerScheduleDose, ScheduleDose, Medicine, User, UserCareTakerMappings } = require('../../../models');


export const scheduleDose = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log("🚀 ~ file: dose.controller.js ~ line 9 ~ scheduleDose ~ userId", userId)
    const user_caretaker = await UserCareTakerMappings.findOne({
      where: {
        caretaker_id: userId
      }
    })
    const patient_id = user_caretaker.patient_id
    console.log("🚀 ~ file: dose.controller.js ~ line 15 ~ scheduleDose ~ patient_id", patient_id)

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

    const doseCreated = await CareTakerScheduleDose.create(payload);


    return successResponse(req, res, {});
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
};


export const updateScheduledDose = async (req, res) => {
  try {
    const { userId } = req.user;
    const user_caretaker = await UserCareTakerMappings.findOne({
      where: {
        caretaker_id: userId
      }
    })
    const patient_id = user_caretaker.patient_id
    const id = req.params.id;
    const {
      slot_ids,
      days,
      count_morning, count_afternoon, count_evening, count_night } = req.body;

    const dose = await CareTakerScheduleDose.findOne({ where: { [Op.and]: [{ patient_id }, { id }] } });
    if (!dose)
      throw new Error('Dose do not exist');

    const payload = {
      slot_ids,
      days,
      count_morning, count_afternoon, count_evening, count_night
    }

    const updatedDose = await CareTakerScheduleDose.update(payload, { where: { id, patient_id } });
    return successResponse(req, res, {});
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
};


export const deleteScheduledDose = async (req, res) => {
  try {
    const id = req.params.id;
    const dose = await CareTakerScheduleDose.findOne({ where: { id } });
    if (!dose)
      throw new Error('Dose do not exist');

    const deletedDose = await CareTakerScheduleDose.destroy({
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
    const { userId } = req.user;
    const user_caretaker = await UserCareTakerMappings.findOne({
      where: {
        caretaker_id: userId
      }
    });

    if (user_caretaker) {
      const patient_id = user_caretaker.patient_id;

      const doses = await ScheduleDose.findAll({
        where: {
          patient_id
        },
        include: [{ model: Medicine, as: 'medicineDetails' }, { model: User, as: 'patientDetails' }]
      });

      return successResponse(req, res, { doses });
    } else { 
      return errorResponse(req, res, "No caretaker found");
    }
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
}