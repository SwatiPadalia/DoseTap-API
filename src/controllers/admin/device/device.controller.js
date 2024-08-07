import { errorResponse, successResponse } from '../../../helpers';
import { Company, Device, DeviceCompanyMappings } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');

export const create = async (req, res) => {
    try {
        const {
            name, description, serialNumber, firmwareVersion
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
            firmwareVersion
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
            name, description, serialNumber, firmwareVersion
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
            name, description, serialNumber, firmwareVersion
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

        console.log('>>>req.query.company_id', req.query.company_id)

        const page = req.query.page || 1;
        const limit = 10;
        const sortOrder = sort == -1 ? 'ASC' : 'DESC';
        const devices = await Device.findAndCountAll({
            where: {
                [Op.and]: [statusFilter === null ? undefined : { "$device_mapping.status$": statusFilter },
                searchFilter === null ? undefined : { searchFilter },
                ((req.query.company_id === undefined) || (req.query.company_id === '' )) ? undefined : { "$device_mapping.company_id$": req.query.company_id }]
            },
            include: [{
                model: DeviceCompanyMappings, as: 'device_mapping', include: [{
                    model: Company, as: 'company'
                }],
            }],
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
            device_id,
            status: true
        };
        const checkDeviceCompanyMapping = await DeviceCompanyMappings.findOne({
            where: {
                company_id,
                device_id
            },
        });
        if (checkDeviceCompanyMapping) {
            throw new Error('Device is already mapped to given Doctor & Company');
        }

        const addDeviceCompanyMapping = await DeviceCompanyMappings.create(payload)

        const markSold = await Device.update({ isSold: 1 }, { where: { id: device_id } });
        return successResponse(req, res, { addDeviceCompanyMapping });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};


