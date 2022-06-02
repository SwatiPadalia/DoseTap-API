import { errorResponse, successResponse } from "../helpers";
import { states } from "../helpers/IndianStatesDistricts.json";
import mailSender from "../mail/sendEmail";
import { Adherence, ScheduleDose } from "../models";
const { Op } = require("sequelize");

export const getStates = async (req, res) => {
  try {
    return successResponse(req, res, { states });
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
};

export const getDoseTapDocuments = async (req, res) => {
  try {
    var document = {
      privacy:
        "https://dosetap-document.s3.ap-south-1.amazonaws.com/privacy.pdf",
      terms: "https://dosetap-document.s3.ap-south-1.amazonaws.com/terms.pdf",
      faq: "https://dosetap-document.s3.ap-south-1.amazonaws.com/terms.pdf",
    };
    return successResponse(req, res, { document });
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
};

export const supportMail = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const params = {
      emailBody: `Message from ${name} , ${email},  ${phone}, message ->> ${message}`,
      subject: "Message From Portal",
      toEmail: "contact@dosetap.com",
    };
    mailSender.sendMail(params);

    return successResponse(req, res, {});
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
};

export const report = async (req, res) => {
  try {
    const id = req.params.id;
    let dateToFilter = null;
    let totalOpen = 0;
    let totalMissed = 0;

    let patients = await ScheduleDose.findAll({
      where: {
        medicine_id: id,
      },
      distinct: true,
      col: "ScheduleDose.patient_id",
      attributes: ["patient_id", "medicine_id", "slot_ids"],
      raw: true,
    });

    for (const p of patients) {
      const adherence_open = await Adherence.findAndCountAll({
        where: {
          [Op.and]: [
            { status: "open" },
            dateToFilter === null ? undefined : { date: dateToFilter },
            { slot_id: { [Op.in]: [...p.slot_ids] } },
            { patient_id: p.patient_id },
          ],
        },
      });

      totalOpen = totalOpen + adherence_open.count;

      const adherence_missed = await Adherence.findAndCountAll({
        where: {
          [Op.and]: [
            { status: "missed" },
            dateToFilter === null ? undefined : { date: dateToFilter },
            { slot_id: { [Op.in]: [...p.slot_ids] } },
            { patient_id: p.patient_id },
          ],
        },
      });

      totalMissed = totalMissed + adherence_missed.count;
    }

    return successResponse(req, res, {
      totalPatients: patients.length,
      totalOpen,
      totalMissed,
    });
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
};
