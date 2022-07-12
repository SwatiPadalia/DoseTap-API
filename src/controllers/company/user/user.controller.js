import { errorResponse, successResponse } from "../../../helpers";
import { Adherence, Company, DeviceUserMapping, User } from "../../../models";
const { Op } = require("sequelize");
const sequelize = require("sequelize");
const randomstring = require("randomstring");
const _ = require("lodash");

export const all = async (req, res) => {
  try {
    let user_ids_mapped_company = [];

    const company_id = req.user.company_id;
    console.log(
      "🚀 ~ file: user.controller.js ~ line 14 ~ all ~ company_id",
      company_id
    );

    let searchFilter = null,
      statusFilter = null,
      stateFilter = null;

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

    if (role == "user") {
      user_ids_mapped_company = [
        ...new Set(
          [
            ...(await DeviceUserMapping.findAll({
              where: {
                company_id,
              },
              attributes: ["patient_id"],
              raw: true,
            })),
          ].map((user) => user.patient_id)
        ),
      ];
    }

    if (role == "doctor") {
      user_ids_mapped_company = [
        ...new Set(
          [
            ...(await DeviceUserMapping.findAll({
              where: {
                company_id,
              },
              attributes: ["doctor_id"],
              raw: true,
            })),
          ].map((user) => user.doctor_id)
        ),
      ];
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
          {
            id: {
              [Op.in]: user_ids_mapped_company,
            },
          },
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

          let patientsIds = [
            ...new Set(
              [
                ...(await DeviceUserMapping.findAll({
                  where: {
                    doctor_id: u.id,
                  },
                })),
              ].map((user) => user.patient_id)
            ),
          ];
          console.log(
            "🚀 ~ file: user.controller.js ~ line 145 ~ all ~ patientsIds",
            patientsIds
          );

          let patients_count = patientsIds.length;

          return {
            ...u.get({ plain: true }),
            company_associated:
              company_associated != null
                ? company_associated.company.name
                : undefined,
            patients_count,
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

export const allCompanyUser = async (req, res) => {
  try {
    const id = req.user.company_id;

    let searchFilter = null,
      statusFilter = null;

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

    const page = req.query.page || 1;
    const limit = 10;
    const sortOrder = sort == -1 ? "ASC" : "DESC";
    const users = await User.findAndCountAll({
      where: {
        [Op.and]: [
          { company_id: id },
          statusFilter === null ? undefined : { status: statusFilter },
          searchFilter === null ? undefined : { searchFilter },
        ],
      },
      order: [["id", sortOrder]],
      offset: (page - 1) * limit,
      limit,
    });
    return successResponse(req, res, {
      users: {
        ...users,
        currentPage: parseInt(page),
        totalPage: Math.ceil(users.count / limit),
      },
    });
  } catch (error) {
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

    let user_ids_mapped_company = [
      ...new Set(
        [
          ...(await DeviceUserMapping.findAll({
            where: {
              doctor_id,
            },
            attributes: ["patient_id"],
            raw: true,
          })),
        ].map((user) => user.patient_id)
      ),
    ];
    console.log(
      "🚀 ~ file: user.controller.js ~ line 295 ~ patientUnderDoctor ~ user_ids_mapped_company",
      user_ids_mapped_company
    );

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
    let user_caretaker = await DeviceUserMapping.findAndCountAll({
      where: {
        [Op.and]: [
          searchFilter === null ? undefined : { searchFilter },
          statusFilter === null ? undefined : { statusFilter },
          stateFilter === null ? undefined : { stateFilter },
        ],
        doctor_id,
        patient_id: {
          [Op.in]: user_ids_mapped_company,
        },
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
