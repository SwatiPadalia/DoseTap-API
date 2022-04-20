import { errorResponse, successResponse } from '../../../helpers';
import { Adherence } from '../../../models';
const { Op } = require('sequelize')

export const tracker = async (req, res) => {
    try {
        const { userId } = req.user;

        const { date } = req.body;
        // const user = await User.findOne({ where: { id: userId } });

        const adherence = await Adherence.findAll({
            where: {
                patient_id: userId,
                date: {
                    [Op.eq]: date
                }
            }
        })

        let morning = false;
        let afternoon = false;
        let evening = false;
        let night = false;

        adherence.map(d => {

            const time = parseInt(d.time.split(':').join('').slice(0, -2))
            if (time >= 900 && time <= 1100 && d.status == "open")
                morning = true
            if (time >= 1200 && time <= 1400 && d.status == "open")
                afternoon = true
            if (time >= 1500 && time <= 1800 && d.status == "open")
                evening = true
            if (time >= 1900 && time <= 2100 && d.status == "open")
                night = true
        })


        let missedTill = 0;
        let openTill = 0
        const adherenceTillDate = await Adherence.findAll({
            where: {
                patient_id: userId,
            }
        })
        adherenceTillDate.map(d => {
            if (d.status == "open") openTill += 1
            else missedTill += 1
        })

        const tillNow = openTill / (openTill + missedTill) * 100


        let new_date = new Date(date);
        let lastDay = new Date(new_date.getFullYear(), new_date.getMonth() + 1, 0);
        let fromDate = new_date.toISOString().slice(0, 10).slice(0, -2) + "01"
        let toDate = new_date.toISOString().slice(0, 10).slice(0, -2) + lastDay.getDate()
        
        let missedTillMonth = 0;
        let openTillMonth = 0
        const adherenceTillMonth = await Adherence.findAll({
            where: {
                patient_id: userId,
                date: {
                    [Op.between]: [fromDate, toDate]
                }
            }
        })
        adherenceTillMonth.map(d => {
            if (d.status == "open") openTillMonth += 1
            else missedTillMonth += 1
        })

        const tillMonth = openTillMonth / (openTillMonth + missedTillMonth) * 100

        return successResponse(req, res, { morning, afternoon, evening, night, tillNow, tillMonth });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};
