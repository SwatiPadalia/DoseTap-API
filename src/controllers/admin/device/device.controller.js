import { errorResponse, successResponse } from '../../../helpers';
import { Device } from '../../../models';
const { Op } = require('sequelize')

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
        return successResponse(req, res, {});
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
        const page = req.query.page || 1;
        const limit = 10;
        const devices = await Device.findAndCountAll({
            order: [['createdAt', 'DESC'], ['id', 'ASC']],
            offset: (page - 1) * limit,
            limit,
        });
        return successResponse(req, res, { devices: {
            ...devices,
            currentPage: parseInt(page),
            totalPage: Math.ceil(devices.count/limit)
        } });

    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};


export const deviceTagToCompanyDoctor = async (req, res) => {
    try {
        const {
            company_id, doctor_id
        } = req.body;

        const payload = {
            company_id,
            doctor_id,
        };
        const addDeviceTagging = await DeviceTagging.create(payload)
        return successResponse(req, res, { addDeviceTagging });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};


