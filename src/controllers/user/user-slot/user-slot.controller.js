import { errorResponse, successResponse, updateOrCreate } from '../../../helpers';
import { Slot, UserSlot } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');

export const create = async (req, res) => {
    try {
        const {
            data
        } = req.body;
        for (const slot of data) {
            const where = {
                slot_id: slot.slot_id,
                user_id: slot.user_id
            }
            await updateOrCreate(UserSlot, where, slot);
        }
        return successResponse(req, res, {});
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
}

export const all = async (req, res) => {
    try {
        const { userId: user_id } = req.user;
        console.log("🚀 ~ file: user-slot.controller.js ~ line 27 ~ all ~ user_id", user_id)

        let user_slot = await UserSlot.findAll({
            where: {
                user_id
            },
            include: [{ model: Slot, as: 'slots' }]
        })

        if (user_slot.length == 0) {
            const slots = await Slot.findAll({
                order: [['id', 'ASC']],
            });
            user_slot = slots.map(s => {
                return {
                    id: s.id,
                    name: s.name,
                    type: s.type,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    order: s.order,
                    displayName: s.displayName,
                    displayType: s.displayType,
                    time: null
                }
            });
            console.log("🚀 ~ file: user-slot.controller.js ~ line 53 ~ all ~ user_slot", user_slot)
        }
        return successResponse(req, res, { user_slot });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
}