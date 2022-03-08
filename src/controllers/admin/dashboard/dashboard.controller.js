import { errorResponse, successResponse } from '../../../helpers';
import { Adherence, Company, Device, DeviceUserMapping, User } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const moment = require('moment')


export const all = async (req, res) => {
    try {
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
                role: 'user'
            }
        })

        data.user = user.count

        const caretaker = await User.findAndCountAll({
            where: {
                role: 'caretaker'
            }
        })

        data.caretaker = caretaker.count

        const company_user = await User.findAndCountAll({
            where: {
                role: 'company'
            }
        })

        data.company_user = company_user.count

        const doctor = await User.findAndCountAll({
            where: {
                role: 'doctor'
            }
        })

        data.doctor = doctor.count

        const company = await Company.findAndCountAll({
        })

        data.company = company.count

        const device = await Device.findAndCountAll({
        })

        data.device = device.count


        const adherence_open = await Adherence.findAndCountAll({
            where: {
                status: 'open'
            }
        })

        const adherence_missed = await Adherence.findAndCountAll({
            where: {
                status: 'missed'
            }
        })

        const adherence_open_count = adherence_open.count
        const adherence_missed_count = adherence_missed.count

        const total = adherence_open_count + adherence_missed_count;
        data.avg_adherence_open = (adherence_open_count / total) ? (adherence_open_count / total) : 0;
        data.avg_adherence_missed = (adherence_missed_count / total) ? (adherence_missed_count / total) : 0;

        const active_users = await DeviceUserMapping.findAndCountAll({
            where: {
                lastSync: {
                    [Op.gte]: moment().subtract(7, 'days').toDate()
                }
            }
        })

        data.active_users = active_users.count;

        let timeline_data = {}
        let xLabels = []
        let yData = []
        let today = new Date();
        for (let i = 0; i < 7; i++) {
            let x = moment().subtract(i, 'days').format("DD-MM-YYYY")
            xLabels.push(x)
            let adherence_open = await Adherence.findAndCountAll({
                where: {
                    status: 'open',
                    date: x
                }
            })

            let adherence_missed = await Adherence.findAndCountAll({
                where: {
                    status: 'missed',
                    date: x
                }
            })

            let total = (adherence_open.count + adherence_missed.count);

            let y = adherence_open.count / total;
            yData.push(y ? y : 0)

        }

        timeline_data.labels = xLabels.reverse();
        timeline_data.data = yData.reverse();
        data.timeline_data = timeline_data;

        return successResponse(req, res, { ...data });

    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};