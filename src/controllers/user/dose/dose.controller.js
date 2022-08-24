import { errorResponse, successResponse } from '../../../helpers';
const { Op } = require('sequelize');
const { ScheduleDose, Medicine, User, CareTakerScheduleDose, CareTakerUserSlot, Slot, UserSlot, UserAlarm } = require('../../../models');


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
    const { userId } = req.user;

    if (req.user.role == "caretaker") {
      const user_caretaker = await UserCareTakerMappings.findOne({
        where: {
          caretaker_id: userId,
        },
      });
      patient_id = user_caretaker.patient_id;
    } else {
      patient_id = userId;
    }

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

    let user_slot = await CareTakerUserSlot.findAll({
      where: {
        user_id: patient_id
      },
      include: [{ model: Slot, as: 'slots' }]
    })

    if (user_slot.length == 0) {
      const slotsData = await Slot.findAll({
        order: [['id', 'ASC']],
      });
      user_slot = slotsData.map(s => {
        return {
          id: s.id,
          name: s.name,
          type: s.type,
          startTime: s.startTime,
          endTime: s.endTime,
          order: s.order,
          displayName: s.displayName,
          displayType: s.displayType,
          time: null,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt
        }
      });

    } else {
      user_slot = user_slot.map(s => {
        return {
          id: s.slot_id,
          name: s.slots.name,
          type: s.slots.type,
          startTime: s.slots.startTime,
          endTime: s.slots.endTime,
          order: s.slots.order,
          displayName: s.slots.displayName,
          displayType: s.slots.displayType,
          time: s.time,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt
        }
      });

    }

    const slots = {
      count: user_slot.length,
      rows: user_slot
    }

    return successResponse(req, res, { doses, slots });
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


    if (status) {
      // Delete from User Slot
      await UserSlot.destroy({
        where: {
          user_id: patient_id
        }
      })

      // Delete from ScheduleDose
      await ScheduleDose.destroy({
        where: {
          patient_id
        }
      })

      // Delete from UserAlarm
      await UserAlarm.destroy({
        where: {
          user_id: patient_id
        }
      })

      // Copy from CareTakerScheduleDose to ScheduleDose


      let careTakerScheduleDose = await CareTakerScheduleDose.findAll({
        where: {
          patient_id
        }
        ,
      })

      for (let i = 0; i < careTakerScheduleDose.length; i++) {
        let payload = {
          patient_id: careTakerScheduleDose[i].patient_id,
          medicine_id: careTakerScheduleDose[i].medicine_id,
          count_morning: careTakerScheduleDose[i].count_morning,
          count_afternoon: careTakerScheduleDose[i].count_afternoon,
          count_evening: careTakerScheduleDose[i].count_evening,
          count_night: careTakerScheduleDose[i].count_night,
          slot_ids: careTakerScheduleDose[i].slot_ids,
          days: careTakerScheduleDose[i].days,
        }

        console.log("🚀 ~ file: dose.controller.js ~ line 207 ~ acceptRejectCareTakerSchedule ~ payload", payload)
        await ScheduleDose.create(payload)
      }

      // Copy from CareTakerSlot to User Slot

      let careTakerUserSlot = await CareTakerUserSlot.findAll({
        where: {
          user_id: patient_id
        }
      })

      for (let j = 0; j < careTakerUserSlot.length; j++) {
        let payload = {
          user_id: careTakerUserSlot[j].user_id,
          slot_id: careTakerUserSlot[j].slot_id,
          time: careTakerUserSlot[j].time
        }

        console.log("🚀 ~ file: dose.controller.js ~ line 216 ~ acceptRejectCareTakerSchedule ~ payload", payload)
        await UserSlot.create(payload)
      }


    }

    // Delete from CareTakerSlot
    await CareTakerUserSlot.destroy({
      where: {
        user_id: patient_id
      }
    })

    // Delete from CareTakerScheduleDose
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