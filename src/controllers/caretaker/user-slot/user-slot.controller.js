import { errorResponse, successResponse, updateOrCreate } from '../../../helpers';
import { CareTakerUserSlot, Slot, UserCareTakerMappings } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');

export const create = async (req, res) => {
    try {
        const {
            data
        } = req.body;

        const { userId } = req.user;
        const user_caretaker = await UserCareTakerMappings.findOne({
            where: {
                caretaker_id: userId
            }
        })
        const user_id = user_caretaker.patient_id


        for (const slot of data) {
            const where = {
                slot_id: slot.slot_id,
                user_id: user_id
            }
            await updateOrCreate(CareTakerUserSlot, where, slot);
        }
        return successResponse(req, res, {});
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
}

export const all = async (req, res) => {
    try {
        const { userId } = req.user;

        const user_caretaker = await UserCareTakerMappings.findOne({
            where: {
                caretaker_id: userId
            }
        })
        const user_id = user_caretaker.patient_id
        console.log("🚀 ~ file: user-slot.controller.js ~ line 34 ~ all ~ user_id", user_id)
        let user_slot = await CareTakerUserSlot.findAll({
            where: {
                user_id
            },
            include: [{ model: Slot, as: 'slots' }]
        })
        console.log("🚀 ~ file: user-slot.controller.js ~ line 41 ~ all ~ user_slot", user_slot)

        if (user_slot.length == 0) {
            const slotsData = await Slot.findAll({
                order: [['id', 'ASC']],
            });
            user_slot = slotsData.map(s => {
                return {
                    id: s.id,
                    name: s.name,
                    type: s.type,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    order: s.order,
                    displayName: s.displayName,
                    displayType: s.displayType,
                    time: null,
                    createdAt: s.createdAt,
                    updatedAt: s.updatedAt
                }
            });

        } else {
            user_slot = user_slot.map(s => {
                return {
                    id: s.slot_id,
                    name: s.slots.name,
                    type: s.slots.type,
                    startTime: s.slots.startTime,
                    endTime: s.slots.endTime,
                    order: s.slots.order,
                    displayName: s.slots.displayName,
                    displayType: s.slots.displayType,
                    time: s.time,
                    createdAt: s.createdAt,
                    updatedAt: s.updatedAt
                }
            });

        }

        const slots = {
            count: user_slot.length,
            rows: user_slot
        }
        return successResponse(req, res, { slots });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
}