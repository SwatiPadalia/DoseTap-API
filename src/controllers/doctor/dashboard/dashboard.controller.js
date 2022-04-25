import { errorResponse, successResponse } from '../../../helpers';
import { Adherence, DeviceUserMapping, User, UserCareTakerMappings } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const moment = require('moment')


export const all = async (req, res) => {
    try {

        const doctor_id = req.user.id;

        let user_ids_mapped_company = [
            ... (await DeviceUserMapping.findAll({
                where: {
                    doctor_id
                },
                attributes: ['patient_id'],
                raw: true
            })),
        ].map(user => user.patient_id);
        console.log("🚀 ~ file: dashboard.controller.js ~ line 21 ~ all ~ user_ids_mapped_company", user_ids_mapped_company)

        let data = {
            user: 0,
            caretaker: 0,
            company_user: 0,
            company: 0,
            doctor: 0,
            device: 0,
            avg_adherence_missed: 0,
            avg_adherence_open: 0,
            active_users: 0
        }
        const user = await User.findAndCountAll({
            where: {
                role: 'user',
                id: { [Op.in]: user_ids_mapped_company }
            }
        })

        data.user = user.count

        const caretaker = await UserCareTakerMappings.findAndCountAll({
            where: {
                patient_id: { [Op.in]: user_ids_mapped_company }
            },
            attributes: [
                [sequelize.fn('DISTINCT', sequelize.col('caretaker_id')), 'caretaker_id'],
            ]
        })

        data.caretaker = caretaker.count


        const adherence_open = await Adherence.findAndCountAll({
            where: {
                status: 'open',
                patient_id: { [Op.in]: user_ids_mapped_company }
            }
        })

        const adherence_missed = await Adherence.findAndCountAll({
            where: {
                status: 'missed',
                patient_id: { [Op.in]: user_ids_mapped_company }
            }
        })

        const adherence_open_count = adherence_open.count
        const adherence_missed_count = adherence_missed.count

        const total = adherence_open_count + adherence_missed_count;
        data.avg_adherence_open = (adherence_open_count / total) ? (adherence_open_count / total) * 100 : 0;
        data.avg_adherence_missed = (adherence_missed_count / total) ? (adherence_missed_count / total) * 100 : 0;

        data.avg_adherence_open = data.avg_adherence_open.toFixed(2)
        data.avg_adherence_missed = data.avg_adherence_missed.toFixed(2)

        const active_users = await DeviceUserMapping.findAndCountAll({
            where: {
                lastSync: {
                    [Op.gte]: moment().subtract(7, 'days').toDate()
                },
                patient_id: { [Op.in]: user_ids_mapped_company }
            }
        })

        data.active_users = active_users.count;

        let timeline_data = {}
        let xLabels = []
        let yData = []
        let today = new Date();
        for (let i = 0; i < 7; i++) {
            let x = moment().subtract(i, 'days').format("YYYY-MM-DD")
            xLabels.push(x)
            let adherence_open = await Adherence.findAndCountAll({
                where: {
                    status: 'open',
                    date: x,
                    patient_id: { [Op.in]: user_ids_mapped_company }
                }
            })

            let adherence_missed = await Adherence.findAndCountAll({
                where: {
                    status: 'missed',
                    date: x,
                    patient_id: { [Op.in]: user_ids_mapped_company }
                }
            })

            let total = (adherence_open.count + adherence_missed.count);

            let y = adherence_open.count / total;
            yData.push(y ? y * 100 : 0)

        }

        timeline_data.labels = xLabels.reverse();
        timeline_data.data = yData.reverse();
        data.timeline_data = timeline_data;

        return successResponse(req, res, { ...data });

    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};