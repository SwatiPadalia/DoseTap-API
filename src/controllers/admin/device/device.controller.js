import { errorResponse, successResponse } from '../../../helpers';
import { Device, DeviceUserMapping } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');

export const create = async (req, res) => {
    try {
        const {
            name, description, serialNumber
        } = req.body;
        const device = await Device.findOne({
            where: {
                [Op.or]: [{ serialNumber }]
            },
        });
        if (device) {
            throw new Error('Device with serial number exists');
        }

        const payload = {
            name,
            description,
            serialNumber,
        };

        const newDevice = await Device.create(payload);
        return successResponse(req, res, {});
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
}

export const update = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            name, description, serialNumber
        } = req.body;

        const device = await Device.findOne({
            where: {
                id
            },
        });
        if (!device) {
            throw new Error('Device do not exist');
        }

        const payload = {
            name, description, serialNumber
        };

        const updatedDevice = await Device.update(payload, { where: { id } });
        return successResponse(req, res, {});
    } catch (error) {
        console.log(error)
        return errorResponse(req, res, error.message);
    }
}

export const statusUpdate = async (req, res) => {
    try {
        const id = req.params.id;

        const device = await Device.findOne({
            where: {
                id
            },
        });
        if (!device) {
            throw new Error('User do not exist');
        }

        let payload = {
            status: !device.status
        };

        const updatedDevice = await Device.update(payload, { where: { id } });
        device.status = !device.status
        return successResponse(req, res, { device });
    } catch (error) {
        console.log(error)
        return errorResponse(req, res, error.message);
    }
}

export const findById = async (req, res) => {
    try {
        const id = req.params.id;
        const device = await Device.findOne({
            where: {
                id
            },
        });
        if (!device) {
            throw new Error('Device do not exist');
        }
        return successResponse(req, res, { device });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};

export const all = async (req, res) => {
    try {
        let searchFilter = null, statusFilter = null;

        const sort = req.query.sort || -1;

        if (req.query.search) {
            const search = req.query.search;

            searchFilter = {
                [Op.or]: [
                    sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('serialNumber')), { [Op.like]: `%${search}%` }
                    )
                ]
            }
        }

        if (req.query.status) {
            const status = req.query.status;
            if (status == 1) {
                statusFilter = true
            } else {
                statusFilter = false
            }
        }

        const page = req.query.page || 1;
        const limit = 10;
        const sortOrder = sort == -1 ? 'ASC' : 'DESC';
        const devices = await Device.findAndCountAll({
            where: {
                [Op.and]: [statusFilter === null ? undefined : { status: statusFilter }, searchFilter === null ? undefined : { searchFilter }]
            },
            order: [['createdAt', 'DESC'], ['id', 'ASC']],
            offset: (page - 1) * limit,
            limit,
        });
        return successResponse(req, res, {
            devices: {
                ...devices,
                currentPage: parseInt(page),
                totalPage: Math.ceil(devices.count / limit)
            }
        });

    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};


export const deviceTagToCompany = async (req, res) => {
    try {
        const {
            company_id, doctor_id, device_id
        } = req.body;

        const payload = {
            company_id,
            device_id
        };
        const checkDeviceUserMapping = await DeviceUserMapping.findOne({
            where: {
                company_id,
                device_id
            },
        });
        if (checkDeviceUserMapping) {
            throw new Error('Device is already mapped to given Doctor & Company');
        }

        const addDeviceUserMapping = await DeviceUserMapping.create(payload)
        return successResponse(req, res, { addDeviceUserMapping });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};


