import { errorResponse, successResponse, updateOrCreate } from '../../../helpers';
import { UserAlarm } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');

export const createOrUpdate = async (req, res) => {
    try {
        const { userId } = req.user;
        const {
            value,
            recordDate,
        } = req.body;

        const payload = {
            user_id: userId,
            recordDate,
            value
        }
        const where = {
            user_id: userId,
            recordDate
        }
        const alarm = await updateOrCreate(UserAlarm, where, payload);
        return successResponse(req, res, {});
    } catch (error) {
        console.log("🚀 ~ file: alarm.controller.js ~ line 26 ~ createOrUpdate ~ error", error)
        const err = error.errors[0];
        return errorResponse(req, res, err.message);
    }
}


