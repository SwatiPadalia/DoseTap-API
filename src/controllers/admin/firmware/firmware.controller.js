import { errorResponse, successResponse } from "../../../helpers";
import { Firmwares } from "../../../models";
const { Op } = require("sequelize");
const sequelize = require("sequelize");

export const create = async (req, res) => {
  try {
    const { version, fileUrl } = req.body;

    const payload = {
      version,
      fileUrl,
    };

    const firmwareWithVersionNameExist = await Firmwares.findOne({
      where: {
        version,
      },
    });

    if (firmwareWithVersionNameExist) {
      throw new Error("Firmware with the given version already exist");
    }

    const firmware = await Firmwares.create(payload);
    return successResponse(req, res, {});
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { version } = req.body;

    const firmware = await Firmwares.findOne({
      where: {
        id,
      },
    });
    if (!firmware) {
      throw new Error("Firmware do not exist");
    }

    const firmwareWithVersionNameExist = await Firmwares.findOne({
      where: {
        version,
      },
    });

    if (!firmwareWithVersionNameExist) {
      throw new Error("Firmware with the given version already exist");
    }

    const payload = {
      version,
    };

    const updatedFirmare = await Firmwares.update(payload, { where: { id } });
    return successResponse(req, res, {});
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
};

export const statusUpdate = async (req, res) => {
  try {
    const id = req.params.id;

    const firmware = await Firmwares.findOne({
      where: {
        id,
      },
    });

    if (!firmware) {
      throw new Error("Firmware do not exist");
    }

    let payload = {
      status: !firmware.status,
    };

    const updatedFirmware = await Firmwares.update(payload, { where: { id } });

    const returnUpdatedFirmware = await Firmwares.findOne({ where: { id } });
    return successResponse(req, res, {
      firmware: returnUpdatedFirmware,
    });
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message);
  }
};

export const findById = async (req, res) => {
  try {
    const id = req.params.id;
    const firmware = await Firmwares.findOne({
      where: {
        id,
      },
    });
    if (!firmware) {
      throw new Error("firmware do not exist");
    }
    return successResponse(req, res, { firmware });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const all = async (req, res) => {
  try {
    let searchFilter = null,
      statusFilter = null;

    const sort = req.query.sort || -1;

    if (req.query.search) {
      const search = req.query.search;

      searchFilter = {
        [Op.or]: [
          sequelize.where(sequelize.fn("LOWER", sequelize.col("version")), {
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
    const firmwares = await Firmwares.findAndCountAll({
      where: {
        [Op.and]: [
          statusFilter === null ? undefined : { status: statusFilter },
          searchFilter === null ? undefined : { searchFilter },
        ],
      },
      order: [
        ["createdAt", "DESC"],
        ["id", "ASC"],
      ],
      offset: (page - 1) * limit,
      limit,
    });
    return successResponse(req, res, {
      firmwares: {
        ...firmwares,
        currentPage: parseInt(page),
        totalPage: Math.ceil(firmwares.count / limit),
      },
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
