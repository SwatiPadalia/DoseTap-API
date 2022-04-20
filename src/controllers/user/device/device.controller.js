import { errorResponse, successResponse } from '../../../helpers';
import { UserAlarm, UserSlot, ScheduleDose } from '../../../models';
const { Op } = require('sequelize')

export const resetDevice = async (req, res) => {
    try {
        const { userId: patient_id } = req.user;

        await UserAlarm.destroy({
            where: {
                user_id: patient_id
            }
        })

        await UserSlot.destroy({
            where: {
                user_id: patient_id
            }
        })

        await ScheduleDose.destroy({
            where: {
                patient_id: patient_id
            }
        })

        return successResponse(req, res, {});
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
}