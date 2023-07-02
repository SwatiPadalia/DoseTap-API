import crypto from "crypto";
import {
  errorResponse,
  successResponse,
  uniqueCode,
  uniqueId,
} from "../../../helpers";
import {
  Adherence,
  Company,
  Device,
  DeviceUserMapping,
  Medicine,
  ScheduleDose,
  User,
  UserCareTakerMappings,
  UserDoctorMappings,
} from "../../../models";
const { Op } = require("sequelize");
const sequelize = require("sequelize");
const randomstring = require("randomstring");
const template = require("../../../mail/mailTemplate");
const mailSender = require("../../../mail/sendEmail");

const _ = require("lodash");

export const create = async (req, res) => {
  try {
    let patient, doctor;
    const {
      firstName,
      lastName,
      dob,
      gender,
      email,
      password,
      phone,
      city,
      role = "patient",
      reference_code,
      state,
    } = req.body;

    const user = await User.scope("withSecretColumns").findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
    });
    if (user) {
      throw new Error("User already exists with same email or phone");
    }

    if (role == "user") {
      const doctorWithActivationCode = await User.findOne({
        where: {
          reference_code,
          role: "doctor",
        },
      });
      if (!doctorWithActivationCode)
        throw new Error("Activation Code do not exist");
      doctor = doctorWithActivationCode;
    }

    if (role == "caretaker") {
      const userWithActivationCode = await User.findOne({
        where: {
          reference_code,
        },
      });
      if (!userWithActivationCode)
        throw new Error("Activation Code do not exist");

      const checkPatientAlreadyMapped = await UserCareTakerMappings.findOne({
        where: {
          patient_id: userWithActivationCode.id,
        },
      });
      if (checkPatientAlreadyMapped)
        throw new Error("Patient already has a care giver");
      patient = userWithActivationCode;
    }
    const reqPass = crypto.createHash("md5").update(password).digest("hex");

    const code =
      reference_code ||
      uniqueCode("lowercase", 4, 4, randomstring.generate(10));

    let payload = {
      email,
      firstName,
      lastName,
      dob,
      password: reqPass,
      isVerified: false,
      verifyToken: uniqueId(),
      role,
      reference_code: role == "user" || role == "doctor" ? code : null,
      gender,
      phone,
      city,
      state,
      company_id: role == "company" ? req.body.company : null,
    };
    console.log(
      "🚀 ~ file: user.controller.js ~ line 75 ~ create ~ role",
      role
    );
    console.log(
      "🚀 ~ file: user.controller.js ~ line 75 ~ create ~ req.body.company_id",
      req.body.company
    );
    const newUser = await User.create(payload);

    console.log("role", role);
    if (role == "caretaker") {
      const mappingPayload = {
        patient_id: patient.id,
        caretaker_id: newUser.id,
      };
      const newUserCaretakerMapping = await UserCareTakerMappings.create(
        mappingPayload
      );
    }

    if (role == "user") {
      const doctorMappingPayload = {
        patient_id: newUser.id,
        doctor_id: doctor.id,
      };
      console.log("doctorMappingPayload", doctorMappingPayload);
      const newUserDoctorMapping = await UserDoctorMappings.create(
        doctorMappingPayload
      );
    }

    const emailParams = {
      name: newUser.firstName + " " + newUser.lastName,
      code,
      email,
      password,
    };

    let emailBody;
    if (role == "caretaker" || role == "doctor") {
      emailBody = template.welcomeAdminWithCodeEmail(emailParams);
    } else {
      emailBody = template.welcomeAdminEmail(emailParams);
    }

    const params = {
      emailBody,
      subject: "Welcome to Dosetap",
      toEmail: email,
    };
    mailSender.sendMail(params);

    return successResponse(req, res, { newUser });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      firstName,
      lastName,
      dob,
      gender,
      email,
      password,
      phone,
      city,
      role,
      state,
    } = req.body;

    const user = await User.scope("withSecretColumns").findOne({
      where: {
        id,
      },
    });
    if (!user) {
      throw new Error("User do not exist");
    }

    console.log("dob", dob);

    let reqPass, payload;
    if (password) {
      console.log("sss");
      reqPass = crypto.createHash("md5").update(password).digest("hex");
      payload = {
        email,
        firstName,
        lastName,
        password: reqPass,
        role,
        gender,
        dob,
        phone,
        city,
        state,
      };
    } else {
      payload = {
        email,
        firstName,
        lastName,
        role,
        gender,
        dob,
        phone,
        city,
        state,
      };
    }

    const updatedUser = await User.update(payload, { where: { id } });
    console.log(
      "🚀 ~ file: user.controller.js ~ line 156 ~ update ~ updatedUser",
      updatedUser
    );
    return successResponse(req, res, {});
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
};

export const statusUpdate = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.scope("withSecretColumns").findOne({
      where: {
        id,
      },
    });
    if (!user) {
      throw new Error("User do not exist");
    }

    let reqPass, payload;
    payload = {
      status: !user.status,
    };

    const updatedUser = await User.update(payload, { where: { id } });

    user.status = !user.status;
    return successResponse(req, res, { user });
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
};

export const findById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({
      where: {
        id,
      },
    });
    if (!user) {
      throw new Error("User do not exist");
    }
    return successResponse(req, res, { user });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const all = async (req, res) => {
  try {
    let searchFilter = null,
      statusFilter = null,
      stateFilter = null,
      companyFilter = null;

    const role = req.query.role;

    if (role === undefined) {
      throw new Error("Role is required in query parameter");
    }

    const sort = req.query.sort || -1;

    if (req.query.search) {
      const search = req.query.search;

      searchFilter = {
        [Op.or]: [
          sequelize.where(sequelize.fn("LOWER", sequelize.col("firstName")), {
            [Op.like]: `%${search}%`,
          }),
          sequelize.where(sequelize.fn("LOWER", sequelize.col("email")), {
            [Op.like]: `%${search}%`,
          }),
          sequelize.where(sequelize.fn("LOWER", sequelize.col("phone")), {
            [Op.like]: `%${search}%`,
          }),
        ],
      };
    }

    if (req.query.status) {
      const status = req.query.status;
      if (status == 1) {
        statusFilter = true;
      } else {
        statusFilter = false;
      }
    }

    if (req.query.state) {
      const state = req.query.state;
      stateFilter = {
        [Op.or]: [
          sequelize.where(sequelize.fn("LOWER", sequelize.col("state")), {
            [Op.like]: `%${state}%`,
          }),
        ],
      };
    }

    if (req.query.company_id) {
      const company_id = req.query.company_id;

      if (role == "doctor") {
        let associated_doctor = [
          ...(await DeviceUserMapping.findAll({
            where: {
              company_id,
            },
            attributes: ["doctor_id"],
            raw: true,
          })),
        ].map((doctor) => doctor.doctor_id);

        companyFilter = {
          id: {
            [Op.in]: associated_doctor,
          },
        };
      }

      if (role == "user") {
        let associated_user = [
          ...(await DeviceUserMapping.findAll({
            where: {
              company_id,
            },
            attributes: ["patient_id"],
            raw: true,
          })),
        ].map((patient) => patient.patient_id);

        companyFilter = {
          id: {
            [Op.in]: associated_user,
          },
        };
      }
    }

    const page = req.query.page || 1;
    const limit = 10;
    const sortOrder = sort == -1 ? "ASC" : "DESC";
    const users = await User.findAndCountAll({
      where: {
        [Op.and]: [
          { role },
          statusFilter === null ? undefined : { status: statusFilter },
          searchFilter === null ? undefined : { searchFilter },
          stateFilter === null ? undefined : { stateFilter },
          companyFilter === null ? undefined : { ...companyFilter },
        ],
      },
      include: [{ model: Company, as: "company" }],
      order: [["id", sortOrder]],
      offset: (page - 1) * limit,
      limit,
    });

    if (role == "user") {
      let rows = await Promise.all(
        users.rows.flatMap(async (u) => {
          let adherence_open = await Adherence.findAndCountAll({
            where: {
              status: "open",
              patient_id: u.id,
            },
          });

          let adherence_missed = await Adherence.findAndCountAll({
            where: {
              status: "missed",
              patient_id: u.id,
            },
          });
          let total = adherence_open.count + adherence_missed.count;

          let y = adherence_open.count / total;
          let adherence = y ? y * 100 : 0;
          return { ...u.get({ plain: true }), adherence };
        })
      );
      users.rows = rows;

      let deviceInfo = await Promise.all(
        users.rows.flatMap(async (u) => {
          console.log(
            "🚀 ~ file: user.controller.js:445 ~ users.rows.flatMap ~ u:",
            u
          );
          const deviceMappings = await DeviceUserMapping.findAll({
            where: {
              patient_id: u.id,
            },
            include: [
              {
                model: User,
                as: "doctor",
              },
              {
                model: User,
                as: "patient",
              },
              {
                model: Device,
                as: "device",
              },
              {
                model: Company,
                as: "company",
              },
            ],
            order: [["id", sortOrder]],
            offset: (page - 1) * limit,
            limit,
          });
          return { ...u, deviceMappings };
        })
      );
      users.rows = deviceInfo;
    }

    if (role == "doctor") {
      let rows = await Promise.all(
        users.rows.flatMap(async (u) => {
          let company_associated = await DeviceUserMapping.findOne({
            where: {
              doctor_id: u.id,
            },
            include: [{ model: Company, as: "company" }],
          });

          return {
            ...u.get({ plain: true }),
            company_associated:
              company_associated != null
                ? company_associated.company.name
                : undefined,
          };
        })
      );
      users.rows = rows;
    }

    return successResponse(req, res, {
      users: {
        ...users,
        currentPage: parseInt(page),
        totalPage: Math.ceil(users.count / limit),
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: user.controller.js ~ line 221 ~ all ~ error",
      error
    );
    return errorResponse(req, res, error.message);
  }
};

export const caretakerMapping = async (req, res) => {
  try {
    let searchFilter = null;

    const sort = req.query.sort || -1;

    if (req.query.search) {
      const search = req.query.search;

      searchFilter = {
        [Op.or]: [
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("caretaker.firstName")),
            { [Op.like]: `%${search}%` }
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("caretaker.email")),
            { [Op.like]: `%${search}%` }
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("caretaker.phone")),
            { [Op.like]: `%${search}%` }
          ),
        ],
      };
    }

    if (req.query.status) {
      const status = req.query.status;
      if (status == 1) {
        statusFilter = true;
      } else {
        statusFilter = false;
      }
    }

    const page = req.query.page || 1;
    const limit = 10;
    const sortOrder = sort == -1 ? "ASC" : "DESC";
    const user_caretaker = await UserCareTakerMappings.findAndCountAll({
      where: {
        [Op.and]: [searchFilter === null ? undefined : { searchFilter }],
      },
      include: [
        { model: User, as: "patient" },
        { model: User, as: "caretaker" },
      ],
      order: [["id", sortOrder]],
      offset: (page - 1) * limit,
      limit,
    });
    return successResponse(req, res, {
      users: {
        ...user_caretaker,
        currentPage: parseInt(page),
        totalPage: Math.ceil(user_caretaker.count / limit),
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: user.controller.js ~ line 307 ~ caretakerMapping ~ error",
      error
    );

    return errorResponse(req, res, error.message);
  }
};

export const patientUnderDoctor = async (req, res) => {
  try {
    const doctor_id = req.params.id;
    console.log(
      "🚀 ~ file: user.controller.js ~ line 374 ~ patientUnderDoctor ~ doctor_id",
      doctor_id
    );

    let searchFilter = null,
      statusFilter = null,
      stateFilter = null;

    const sort = req.query.sort || -1;

    if (req.query.search) {
      const search = req.query.search;

      searchFilter = {
        [Op.or]: [
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("patient.firstName")),
            { [Op.like]: `%${search}%` }
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("patient.email")),
            { [Op.like]: `%${search}%` }
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("patient.phone")),
            { [Op.like]: `%${search}%` }
          ),
        ],
      };
    }

    if (req.query.status) {
      const status = req.query.status;
      if (status == 1) {
        statusFilter = sequelize.where(
          sequelize.fn("LOWER", sequelize.col("patient.status")),
          { [Op.eq]: true }
        );
      } else {
        statusFilter = sequelize.where(
          sequelize.fn("LOWER", sequelize.col("patient.status")),
          { [Op.eq]: false }
        );
      }
    }

    if (req.query.state) {
      const state = req.query.state;
      stateFilter = {
        [Op.or]: [
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("patient.state")),
            { [Op.like]: `%${state}%` }
          ),
        ],
      };
    }

    const page = req.query.page || 1;
    const limit = 10;
    const sortOrder = sort == -1 ? "ASC" : "DESC";
    const user_caretaker = await DeviceUserMapping.findAndCountAll({
      where: {
        [Op.and]: [
          searchFilter === null ? undefined : { searchFilter },
          statusFilter === null ? undefined : { statusFilter },
          stateFilter === null ? undefined : { stateFilter },
        ],
        doctor_id,
      },
      include: [{ model: User, as: "patient" }],
      order: [["id", sortOrder]],
      offset: (page - 1) * limit,
      limit,
    });

    user_caretaker.rows = _.uniqBy(user_caretaker.rows, function (e) {
      return e.patient_id;
    });

    let rows = await Promise.all(
      user_caretaker.rows.flatMap(async (u) => {
        let adherence_open = await Adherence.findAndCountAll({
          where: {
            status: "open",
            patient_id: u.patient_id,
          },
        });

        let adherence_missed = await Adherence.findAndCountAll({
          where: {
            status: "missed",
            patient_id: u.patient_id,
          },
        });
        let total = adherence_open.count + adherence_missed.count;

        let y = adherence_open.count / total;
        let adherence = y ? (y * 100).toFixed(2) : 0;
        return {
          ...u.get({ plain: true }),
          patient: {
            ...u.patient.get({ plain: true }),
            adherence,
          },
        };
      })
    );

    user_caretaker.rows = rows;
    return successResponse(req, res, {
      users: {
        ...user_caretaker,
        currentPage: parseInt(page),
        totalPage: Math.ceil(user_caretaker.count / limit),
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: user.controller.js ~ line 307 ~ caretakerMapping ~ error",
      error
    );

    return errorResponse(req, res, error.message);
  }
};

export const doses = async (req, res) => {
  try {
    const patient_id = req.params.id;
    const data = await ScheduleDose.findAll({
      where: {
        patient_id,
      },

      include: {
        model: Medicine,
        as: "medicineDetails",
      },
    });
    return successResponse(req, res, { data });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const medicineAdherenceDataPerUser = async (req, res) => {
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
      

      total_adherence_open.rows.map((ao) => {
        if (slotIds.includes(ao.slot_id)) {
          totalOpen++;
        }
      });

      total_adherence_missed.rows.map((ao) => {
        if (slotIds.includes(ao.slot_id)) {
          totalMissed++;
        }
      });

      result.push({
        totalOpen,
        totalMissed,
        medicineId: scheduledMedicines[0].medicine_id,
        medicineName: scheduledMedicines[0].medicineDetails.name,
        companyName: scheduledMedicines[0].medicineDetails.companyName,
      });
    }

    return successResponse(req, res, {
      medicines: result,
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
