import { errorResponse, successResponse } from '../../../helpers';
import { Slot } from '../../../models';
const { Op } = require('sequelize')

export const create = async (req, res) => {
    try {
        const {
            name, type, startTime, endTime, order, displayName, displayType
        } = req.body;
        const slot = await Slot.findOne({
            where: {
                [Op.or]: [{ order }]
            },
        });
        if (slot) {
            throw new Error('Order number exists');
        }

        const payload = {
            name, type, startTime, endTime, order, displayName, displayType
        };

        const newSlot = await Slot.create(payload);
        return successResponse(req, res, {});
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
}

export const update = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            name, type, startTime, endTime, order, displayName, displayType
        } = req.body;

        const slot = await Slot.findOne({
            where: {
                id
            },
        });
        if (!slot) {
            throw new Error('Slot do not exist');
        }

        const payload = {
            name, type, startTime, endTime, order, displayName, displayType
        };

        const updatedSlot = await Slot.update(payload, { where: { id } });
        return successResponse(req, res, {});
    } catch (error) {
        console.log(error)
        return errorResponse(req, res, error.message);
    }
}

export const findById = async (req, res) => {
    try {
        const id = req.params.id;
        const slot = await Slot.findOne({
            where: {
                id
            },
        });
        if (!slot) {
            throw new Error('Slot do not exist');
        }
        return successResponse(req, res, { slot });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};

export const all = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = 10;
        const slots = await Slot.findAndCountAll({
            order: [['id', 'ASC']],
            offset: (page - 1) * limit,
            limit,
        });
        return successResponse(req, res, { slots });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};

