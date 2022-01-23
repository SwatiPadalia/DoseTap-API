import { errorResponse, successResponse } from '../../../helpers';
import { UserSlot } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');

export const create = async (req, res) => {
    try {
        const {
            slot_id, user_id, time
        } = req.body;
        
        const medicine = await Medicine.findOne({
            where: {
                [Op.or]: [{ name }, { companyName }]
            },
        });
        if (medicine) {
            throw new Error('Medicine exists');
        }

        const payload = {
            name, companyName
        };

        const newCompany = await Medicine.create(payload);
        return successResponse(req, res, {});
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
}