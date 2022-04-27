import { errorResponse, successResponse } from '../../../helpers';
import { Adherence } from '../../../models';
const { Op } = require('sequelize')

export const tracker = async (req, res) => {
    try {
        const { userId } = req.user;

        const { date } = req.body;
        // const user = await User.findOne({ where: { id: userId } });

        let morning = false;
        let afternoon = false;
        let evening = false;
        let night = false;

        let inputDate = new Date(date);
        let todaysDate = new Date();

        if (inputDate.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0)) {

            morning = null;
            afternoon = null;
            evening = null;
            night = null;

            var d = new Date();
            var curr_hour = d.getHours();
            var curr_min = d.getMinutes();
            curr_min = curr_min.toString().length == 1 ? "0" + curr_min : curr_min
            var curr_time = curr_hour + ":" + curr_min + ":" + "00";
            console.log(' True ', curr_time)

            const todays_adherence = await Adherence.findAll({
                where: {
                    patient_id: userId,
                    date: {
                        [Op.eq]: date,
                    },
                    time: {
                        [Op.lte]: curr_time
                    }
                }
            })

            console.log(' adherence ', todays_adherence)

            todays_adherence.map(d => {
                const time = parseInt(d.time.split(':').join('').slice(0, -2))
                console.log("🚀 ~ file: data.controller.js ~ line 50 ~ tracker ~ time", time)
                if (time >= 900 && time <= 1100) {
                    if (d.status == "open")
                        morning = true;
                    else
                        morning = false;
                    afternoon = null;
                    evening = null;
                    night = null;
                }

                if (time >= 1200 && time <= 1400) {
                    if (d.status == "open")
                        afternoon = true;
                    else
                        afternoon = false;
                    evening = null;
                    night = null;
                }
                if (time >= 1500 && time <= 1800) {
                    if (d.status == "open")
                        evening = true;
                    else
                        evening = false;
                    night = null;
                }
                if (time >= 1900 && time <= 2100) {
                    if (d.status == "open")
                        night = true;
                    else
                        night = false;
                }
            })

        } else {

            const adherence = await Adherence.findAll({
                where: {
                    patient_id: userId,
                    date: {
                        [Op.eq]: date
                    }
                }
            })

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
        }


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

        const tillNow = (openTill / (openTill + missedTill) * 100).toFixed(2) || 0


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

        const tillMonth = (openTillMonth / (openTillMonth + missedTillMonth) * 100).toFixed(2) || 0

        return successResponse(req, res, { morning, afternoon, evening, night, tillNow, tillMonth });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};



export const report = async (req, res) => {
    try {
        const { userId } = req.user;

        const { fromDate, toDate } = req.body;

        let open = 0;
        let missed = 0;
        const adherence = await Adherence.findAll({
            where: {
                patient_id: userId,
                date: {
                    [Op.between]: [fromDate, toDate]
                }
            }
        })
        adherence.map(d => {
            if (d.status == "open") open += 1
            else missed += 1
        })

        const adherencePercentage = (open / (open + missed) * 100) || 0

        return successResponse(req, res, { open, missed, adherencePercentage });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};
