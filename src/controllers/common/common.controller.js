import jwt from 'jsonwebtoken';
import { errorResponse, successResponse } from "../../helpers";
import { states } from "../../helpers/IndianStatesDistricts.json";
import mailSender from "../../mail/sendEmail";
import {
  Adherence,
  DeviceUserMapping,
  Medicine,
  ScheduleDose,
  User
} from "../../models";
const { Op } = require("sequelize");
const sequelize = require("sequelize");
const otpGenerator = require('otp-generator');
const otpTool = require("otp-without-db");
const otpHashKey = process.env.SECRET;

const msg91AuthKey = process.env.MSG91AUTHKEY;

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
      user_manual: "https://dosetap-document.s3.ap-south-1.amazonaws.com/terms.pdf"
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
    let totalOpen = 0;
    let totalMissed = 0;
    const role = req.user.role;
    let dateToFilter = null,
      stateFilter = null,
      genderFilter = null,
      ageFilter = null;

    console.log(
      "🚀 ~ file: common.controller.js ~ line 55 ~ report ~ role",
      role
    );
    let mapped_user_ids = [];

    if (role == "admin") {
      mapped_user_ids = [
        ...(await DeviceUserMapping.findAll({
          attributes: ["patient_id"],
          raw: true,
        })),
      ].map((user) => user.patient_id);
    }

    if (role == "company") {
      mapped_user_ids = [
        ...(await DeviceUserMapping.findAll({
          where: {
            company_id: req.user.company_id,
          },
          attributes: ["patient_id"],
          raw: true,
        })),
      ].map((user) => user.patient_id);
    }

    if (role == "doctor") {
      mapped_user_ids = [
        ...(await DeviceUserMapping.findAll({
          where: {
            doctor_id: req.user.id,
          },
          attributes: ["patient_id"],
          raw: true,
        })),
      ].map((user) => user.patient_id);
    }

    console.log(
      "🚀 ~ file: common.controller.js ~ line 67 ~ report ~ mapped_user_ids",
      mapped_user_ids
    );

    let patients = await ScheduleDose.findAll({
      where: {
        medicine_id: id,
        patient_id: {
          [Op.in]: mapped_user_ids,
        },
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

export const medicineAdherenceData = async (req, res) => {
  try {
    let searchFilter = null;

    const role = req.user.role;

    const sort = req.query.sort || -1;

    let mapped_user_ids = [];

    if (role == "admin") {
      mapped_user_ids = [
        ...(await DeviceUserMapping.findAll({
          attributes: ["patient_id"],
          raw: true,
        })),
      ].map((user) => user.patient_id);
    }

    if (role == "company") {
      mapped_user_ids = [
        ...(await DeviceUserMapping.findAll({
          where: {
            company_id: req.user.company_id,
          },
          attributes: ["patient_id"],
          raw: true,
        })),
      ].map((user) => user.patient_id);
    }

    if (role == "doctor") {
      mapped_user_ids = [
        ...(await DeviceUserMapping.findAll({
          where: {
            doctor_id: req.user.id,
          },
          attributes: ["patient_id"],
          raw: true,
        })),
      ].map((user) => user.patient_id);
    }

    if (req.query.search) {
      const search = req.query.search;

      searchFilter = {
        [Op.or]: [
          sequelize.where(sequelize.fn("LOWER", sequelize.col("name")), {
            [Op.like]: `%${search}%`,
          }),
          sequelize.where(sequelize.fn("LOWER", sequelize.col("companyName")), {
            [Op.like]: `%${search}%`,
          }),
        ],
      };
    }

    const page = req.query.page || 1;
    const limit = 10;
    const sortOrder = sort == -1 ? "ASC" : "DESC";
    const medicines = await Medicine.findAndCountAll({
      where: {
        [Op.and]: [searchFilter === null ? undefined : { searchFilter }],
      },
      order: [["name", "ASC"]],
      offset: (page - 1) * limit,
      limit,
    });

    const medicineResult = {
      count: 0,
      rows: [],
    };

    medicineResult.count = medicines.count;

    console.log("mapped_user_ids >>", mapped_user_ids);
    for (const m of medicines.rows) {
      const count = await ScheduleDose.findAndCountAll({
        where: {
          medicine_id: m.id,
          patient_id: {
            [Op.in]: mapped_user_ids,
          },
        },
        distinct: true,
        col: "patient_id",
      });
      let medicine = {
        id: m.id,
        name: m.name,
        companyName: m.companyName,
        count: count.count,
      };

      medicineResult.rows.push(medicine);
    }
    return successResponse(req, res, {
      medicines: {
        ...medicineResult,
        currentPage: parseInt(page),
        totalPage: Math.ceil(medicines.count / limit),
      },
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};


export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    let user = await User.findOne({
      where: {
        phone,
      },
    });
    if (user) {
      const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
      let hash = otpTool.createNewOTP(phone, otp, otpHashKey);
      return successResponse(req, res, { hash, otp })

    }
    return errorResponse(req, res, "Phone number not found");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
}

export const verifyOTP = async (req, res) => {
  try {
    const { phone, hash, otp } = req.body;
    let result = otpTool.verifyOTP(phone, otp, hash, otpHashKey);
    if (result) {
      const isUser = await User.findOne({
        where: {
          phone
        }
      })

      if (!isUser) {
        return errorResponse(req, res, "User not found with this email address!");
      }

      const env = process.env.NODE_ENV || 'development';

      let randomToken = jwt.sign(
        {
          user: {
            phone,
            createdAt: new Date(),
          },
        },
        process.env.SECRET,
      );

      isUser.resetToken = randomToken;
      isUser.save();
      return successResponse(req, res, { message: 'success', token: randomToken })
    }
    else
      return errorResponse(req, res, "invalid OTP");
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
}
