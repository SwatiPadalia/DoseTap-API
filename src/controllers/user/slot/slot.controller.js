import { errorResponse, successResponse } from '../../../helpers';
import { Slot } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');

export const all = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = 10;
        const slots = await Slot.findAndCountAll({
            order: [['id', 'ASC']],
            offset: (page - 1) * limit,
            limit,
        });
        return successResponse(req, res, {
            slots: {
                ...slots,
                currentPage: parseInt(page),
                totalPage: Math.ceil(slots.count / limit)
            }
        });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};