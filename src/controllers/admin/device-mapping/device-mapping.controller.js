import { errorResponse, successResponse } from "../../../helpers";
import {
  Company,
  Device,
  DeviceCompanyMappings,
  DeviceUserMapping,
  User,
} from "../../../models";
const { Op } = require("sequelize");
const sequelize = require("sequelize");

export const partialMapping = async (req, res) => {
  try {
    let searchDoctorFilter = null,
      searchPatientFilter = null,
      searchCompanyFilter = null,
      searchDeviceFilter = null;
    console.log("hey");
    const sort = req.query.sort || -1;

    if (req.query.search) {
      const search = req.query.search;
      searchDeviceFilter = {
        [Op.or]: [
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("device.serialNumber")),
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

    console.log(searchDeviceFilter);
    const page = req.query.page || 1;
    const limit = 10;
    const sortOrder = sort == -1 ? "ASC" : "DESC";
    const deviceMappings = await DeviceCompanyMappings.findAndCountAll({
      include: [
        {
          model: Device,
          as: "device",
          where: {
            [Op.and]: [
              searchDeviceFilter === null ? undefined : { searchDeviceFilter },
            ],
          },
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
    return successResponse(req, res, {
      deviceMappings: {
        ...deviceMappings,
        currentPage: parseInt(page),
        totalPage: Math.ceil(deviceMappings.count / limit),
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: device-mapping.controller.js ~ line 56 ~ all ~ error",
      error
    );
    return errorResponse(req, res, error.message);
  }
};

export const completeMapping = async (req, res) => {
  try {
    let searchDoctorFilter = null,
      searchPatientFilter = null,
      searchCompanyFilter = null,
      searchDeviceFilter = null;
    console.log("hey");
    const sort = req.query.sort || -1;

    const searchCompany = req.query.searchCompany;
    const searchDoctor = req.query.searchDoctor;
    const searchPatient = req.query.searchPatient;
    const searchDevice = req.query.searchDevice;
    console.log(
      "🚀 ~ file: device-mapping.controller.js:95 ~ completeMapping ~ searchDevice:",
      searchDevice
    );

    if (searchDevice)
      searchDeviceFilter = {
        [Op.or]: [
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("device.serialNumber")),
            { [Op.like]: `%${searchDevice.replace("+", " ")}%` }
          ),
        ],
      };
    if (searchCompany)
      searchCompanyFilter = {
        [Op.or]: [
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("company.name")),
            {
              [Op.like]: `%${searchCompany.replace("+", " ")}%`,
            }
          ),
        ],
      };
    if (searchDoctor)
      searchDoctorFilter = {
        [Op.or]: [
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("doctor.firstName")),
            {
              [Op.like]: `%${searchDoctor.replace("+", " ")}%`,
            }
          ),
        ],
      };
    if (searchPatient)
      searchPatientFilter = {
        [Op.or]: [
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("patient.firstName")),
            {
              [Op.like]: `%${searchPatient.replace("+", " ")}%`,
            }
          ),
        ],
      };

    console.log(">>searchDeviceFilter", searchDeviceFilter);
    console.log(">>searchCompanyFilter", searchCompanyFilter);
    console.log(">>searchDoctorFilter", searchDoctorFilter);
    console.log(">>searchPatientFilter", searchPatientFilter);

    const page = req.query.page || 1;
    const limit = 10;
    const sortOrder = sort == -1 ? "ASC" : "DESC";
    const deviceMappings = await DeviceUserMapping.findAndCountAll({
      where: {
        [Op.and]: [
          searchDeviceFilter == null ? undefined : { searchDeviceFilter },
          searchCompanyFilter == null ? undefined : { searchCompanyFilter },
          searchDoctorFilter == null ? undefined : { searchDoctorFilter },
          searchPatientFilter == null ? undefined : { searchPatientFilter },
        ],
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
    return successResponse(req, res, {
      deviceMappings: {
        ...deviceMappings,
        currentPage: parseInt(page),
        totalPage: Math.ceil(deviceMappings.count / limit),
      },
    });
  } catch (error) {
    console.log(
      "🚀 ~ file: device-mapping.controller.js ~ line 56 ~ all ~ error",
      error
    );
    return errorResponse(req, res, error.message);
  }
};

export const updateStatusDeviceMapping = async (req, res) => {
  try {
    const id = req.params.id;

    let deviceMapping = await DeviceCompanyMappings.findOne({
      where: {
        id,
      },
    });

    if (!deviceMapping) {
      return errorResponse(req, res, "Device Mapping not found!");
    }

    let result = await DeviceCompanyMappings.update(
      { status: !deviceMapping.status },
      { where: { id } }
    );
   
    return successResponse(req, res, {});
  } catch (error) {
    console.log(
      "🚀 ~ file: device-mapping.controller.js ~ line 56 ~ all ~ error",
      error
    );
    return errorResponse(req, res, error.message);
  }
};
