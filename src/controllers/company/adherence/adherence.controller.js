import _ from "underscore";
import { errorResponse, getAge, successResponse } from "../../../helpers";
import {
  Adherence,
  DeviceUserMapping,
  Medicine,
  ScheduleDose,
  User,
} from "../../../models";
const { Op } = require("sequelize");
const sequelize = require("sequelize");

export const adherenceData = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    console.log(
      "🚀 ~ file: adherence.controller.js ~ line 12 ~ adherenceData ~ company_id",
      company_id
    );

    let dateToFilter = null,
      stateFilter = null,
      genderFilter = null,
      ageFilter = null;

    let bucket_100_80 = 0;
    let bucket_80_50 = 0;
    let bucket_50_30 = 0;
    let bucket_30 = 0;
    let avg_adherence = 0;

    if (req.query.state) {
      const state = req.query.state;
      stateFilter = sequelize.where(
        sequelize.fn("LOWER", sequelize.col("state")),
        { [Op.like]: `%${state}%` }
      );
    }

    if (req.query.gender) {
      const gender = req.query.gender;
      if (gender == "male") {
        genderFilter = "male";
      } else {
        genderFilter = "female";
      }
    }

    let user_ids_mapped_company = [
      ...(await DeviceUserMapping.findAll({
        where: {
          company_id,
        },
        attributes: ["patient_id"],
        raw: true,
      })),
    ].map((user) => user.patient_id);

    let users = await User.findAll({
      where: {
        [Op.and]: [
          stateFilter === null ? undefined : { state: stateFilter },
          genderFilter === null ? undefined : { gender: genderFilter },
          { role: "user" },
          {
            id: {
              [Op.in]: user_ids_mapped_company,
            },
          },
        ],
      },
      attributes: ["id", "dob"],
    });

    if (req.query.age) {
      const age = req.query.age;
      users = users.filter((u) => {
        let dob = getAge(u.dob);
        console.log(
          "🚀 ~ file: adherence.controller.js ~ line 45 ~ adherenceData ~ dob",
          dob
        );

        if (age == 1) return dob >= 70;

        if (age == 2) return dob >= 60 && dob < 70;

        if (age == 3) return dob >= 50 && dob < 60;

        if (age == 4) return dob >= 40 && dob < 50;

        if (age == 5) return dob < 40;

        return true;
      });
    }

    if (req.query.from && req.query.to) {
      const from = new Date(req.query.from).toISOString().split("T")[0];
      const to = new Date(req.query.to).toISOString().split("T")[0];
      dateToFilter = {
        [Op.between]: [from, to],
      };
    }

    let total_avg_adherence = 0;
    for (const u of users) {
      const adherence_open = await Adherence.findAndCountAll({
        where: {
          [Op.and]: [
            { status: "open" },
            dateToFilter === null ? undefined : { date: dateToFilter },
            { patient_id: u.id },
          ],
        },
      });

      const adherence_missed = await Adherence.findAndCountAll({
        where: {
          [Op.and]: [
            { status: "missed" },
            dateToFilter === null ? undefined : { date: dateToFilter },
            { patient_id: u.id },
          ],
        },
      });

      let total = adherence_open.count + adherence_missed.count;
      let avg = (adherence_open.count / total) * 100 || 0;
      total_avg_adherence = total_avg_adherence + avg;
      if (avg <= 100 && avg >= 80) bucket_100_80++;
      if (avg < 80 && avg >= 50) bucket_80_50++;
      if (avg < 50 && avg >= 30) bucket_50_30++;
      if (avg < 30 && avg > 0) bucket_30++;
    }
    avg_adherence = total_avg_adherence / users.length || 0;

    return successResponse(req, res, {
      users,
      bucket_100_80,
      bucket_80_50,
      bucket_50_30,
      bucket_30,
      avg_adherence: avg_adherence.toFixed(2),
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const medicineAdherenceData = async (req, res) => {
  try {
    const company_id = req.user.company_id;

    let searchFilter = null;

    const sort = req.query.sort || -1;

    const patientsTagged = await DeviceUserMapping.findAll({
      where: {
        company_id,
      },
      attributes: ["patient_id"],
    });

    let patientsTaggedIds = patientsTagged.map((du) => du.patient_id);

    console.log(
      "🚀 ~ file: adherence.controller.js ~ line 145 ~ medicineAdherenceData ~ patientsTagged",
      patientsTaggedIds
    );

    const medicinesTagged = await ScheduleDose.findAll({
      where: {
        patient_id: {
          [Op.in]: patientsTaggedIds,
        },
      },
      attributes: ["medicine_id"],
    });

    let medicineTaggedIds = medicinesTagged.map((m) => m.medicine_id);
    console.log(
      "🚀 ~ file: adherence.controller.js ~ line 179 ~ medicineAdherenceData ~ medicineTaggedIds",
      medicineTaggedIds
    );

    if (req.query.search) {
      const search = req.query.search;

      searchFilter = {
        [Op.or]: [
          sequelize.where(sequelize.fn("LOWER", sequelize.col("name")), {
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
        [Op.and]: [
          searchFilter === null
            ? { id: medicineTaggedIds }
            : { searchFilter, id: medicineTaggedIds },
        ],
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

    let user_ids_mapped_company = [
      ...(await DeviceUserMapping.findAll({
        where: {
          company_id,
        },
        attributes: ["patient_id"],
        raw: true,
      })),
    ].map((user) => user.patient_id);

    console.log(
      "🚀 ~ file: adherence.controller.js ~ line 176 ~ medicineAdherenceData ~ user_ids_mapped_company",
      user_ids_mapped_company
    );

    for (const m of medicines.rows) {
      const patient_ids = [
        ...(await ScheduleDose.findAll({
          where: {
            medicine_id: m.id,
          },
          distinct: true,
          col: "patient_id",
        })),
      ].map((user) => user.patient_id);

      console.log(
        "🚀 ~ file: adherence.controller.js ~ line 187 ~ medicineAdherenceData ~ patients",
        patient_ids
      );

      let commonPatients = _.intersection(patient_ids, user_ids_mapped_company);

      console.log(
        "🚀 ~ file: adherence.controller.js ~ line 192 ~ medicineAdherenceData ~ commonPatients",
        commonPatients
      );
      let medicine = {
        id: m.id,
        name: m.name,
        count: commonPatients.length,
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
