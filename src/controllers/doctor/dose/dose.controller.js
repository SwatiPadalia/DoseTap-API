import { errorResponse, successResponse } from '../../../helpers';
const { Op } = require('sequelize');
const { ScheduleDose, Medicine, User, Adherence } = require('../../../models');
const _ = require('lodash')

export const allMedicine = async (req, res) => {

    try {
        const patient_id = req.params.id;
    
        const scheduledMedicines = await ScheduleDose.findAll({
          where: {
            patient_id,
          },
    
          include: {
            model: Medicine,
            as: "medicineDetails",
          },
        });
       
        const total_adherence_open = await Adherence.findAndCountAll({
          where: {
            [Op.and]: [{ status: "open" }, { patient_id: patient_id }],
          },
        });
       
        const total_adherence_missed = await Adherence.findAndCountAll({
          where: {
            [Op.and]: [{ status: "missed" }, { patient_id: patient_id }],
          },
        });
        const result = [];
    
        for (let i = 0; i < scheduledMedicines.length; i++) {
          let totalOpen = 0;
          let totalMissed = 0;
          const slotIds = scheduledMedicines[i].slot_ids;
          let openBox = [];
          let missedBox = [];
    
          total_adherence_open.rows.map((ao) => {
            if (slotIds.includes(ao.slot_id)) {
              openBox.push(ao);
              totalOpen++;
            }
          });
    
          total_adherence_missed.rows.map((ao) => {
            if (slotIds.includes(ao.slot_id)) {
              missedBox.push(ao);
              totalMissed++;
            }
          });
    
          result.push({
            totalOpen,
            totalMissed,
            openBox,
            missedBox,
            medicineId: scheduledMedicines[i].medicine_id,
            medicineName: scheduledMedicines[i].medicineDetails.name,
            companyName: scheduledMedicines[i].medicineDetails.companyName,
          });
        }
    
        return successResponse(req, res, {
          medicines: result,
        });
      } catch (error) {
        return errorResponse(req, res, error.message);
      }
}