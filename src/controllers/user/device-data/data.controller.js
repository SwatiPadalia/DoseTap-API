import { errorResponse, successResponse } from '../../../helpers';
import { Adherence, DeviceUserMapping, UserCareTakerMappings } from '../../../models';
const { Op } = require('sequelize')
const moment = require('moment');

export const tracker = async (req, res) => {
    try {
        const { role } = req.user;
        
        let userId = req.user.userId;

        if (role == "caretaker") {
          let userCareTakerMapping = await UserCareTakerMappings.findOne({
            where: {
              caretaker_id: userId,
            },
          });
          
          userId = userCareTakerMapping.patient_id;
        } 

        console.log('"🚀 ~ file: data.controller.js ~ line 22 ~ userId ~ userId', userId)

        const { date } = req.body;

        let morning = 'NOT AVAILABLE';
        let afternoon = 'NOT AVAILABLE';
        let evening = 'NOT AVAILABLE';
        let night = 'NOT AVAILABLE';

        let inputDate = new Date(date);
        let todaysDate = new Date();

        if (inputDate.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0)) {

            var dt = new Date();
            let d = moment(dt).tz("Asia/Kolkata");
            var curr_time = d.format("HH:mm:ss");
            console.log("🚀 ~ file: data.controller.js ~ line 27 ~ tracker ~ curr_time", curr_time)

            const todays_adherence = await Adherence.findAll({
                where: {
                    patient_id: userId,
                    date: {
                        [Op.eq]: date,
                    },
                    // time: {
                    // [Op.lte]: curr_time
                    // }
                }
            })

            console.log(' adherence ', todays_adherence)

            todays_adherence.map(d => {
                const time = parseInt(d.time.split(':').join('').slice(0, -2))
                console.log("🚀 ~ file: data.controller.js ~ line 42 ~ tracker ~ time", time)

                if (time >= 500 && time < 1200) {
                    if (d.status == "open")
                        morning = 'TAKEN';
                    else
                        morning = 'MISSED';
                }

                if (time >= 1200 && time < 1500) {
                    if (d.status == "open")
                        afternoon = 'TAKEN';
                    else
                        afternoon = 'MISSED';
                }
                if (time >= 1500 && time < 1900) {
                    if (d.status == "open")
                        evening = 'TAKEN';
                    else
                        evening = 'MISSED';
                }
                if (time >= 1900 && time <= 2300) {
                    if (d.status == "open")
                        night = 'TAKEN';
                    else
                        night = 'MISSED';
                }
            })

            console.log("morning >>>", morning);
            console.log("afternoon >>>>", afternoon);
            console.log("evening >>>", evening);
            console.log("night >>>> ", night);



            const parsedTimeNow = parseInt(curr_time.split(':').join('').slice(0, -2))

            if (parsedTimeNow < 500) {
                morning = 'DUE'
                afternoon = 'DUE'
                evening = 'DUE'
                night = 'DUE'
            }

            if (morning != "TAKEN" && morning != "MISSED") {
                if (parsedTimeNow >= 500 && parsedTimeNow < 1200) {
                    morning = 'DUE'
                    afternoon = 'DUE'
                    evening = 'DUE'
                    night = 'DUE'
                }
            }
            if (afternoon != "TAKEN" && afternoon != "MISSED") {
                if (parsedTimeNow >= 1200 && parsedTimeNow <= 1500) {
                    afternoon = 'DUE'
                    evening = 'DUE'
                    night = 'DUE'
                }
            }

            if (evening != "TAKEN" && evening != "MISSED") {
                if (parsedTimeNow >= 1500 && parsedTimeNow < 1900) {
                    evening = 'DUE'
                    night = 'DUE'
                }
            }
            if (night != "TAKEN" && night != "MISSED") {
                if (parsedTimeNow >= 1900 && parsedTimeNow <= 2300) {
                    night = 'DUE'
                }
            }

        }
        else {

            let lastSyncData = await DeviceUserMapping.findOne({
                limit: 1,
                where: {
                    patient_id: userId
                },
                order: [['createdAt', 'DESC']]
            })

            if (lastSyncData) {
                let lastSyncDate = require('moment')(lastSyncData.lastSync).format('YYYY-MM-DD')

                console.log("🚀 ~ file: data.controller.js ~ line 31 ~ tracker ~ lastSyncDate", lastSyncDate)

                if (inputDate.setHours(0, 0, 0, 0) > (new Date(lastSyncDate)).setHours(0, 0, 0, 0)) {

                    morning = 'NOT AVAILABLE';
                    afternoon = 'NOT AVAILABLE';
                    evening = 'NOT AVAILABLE';
                    night = 'NOT AVAILABLE';

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
                        console.log("🚀 ~ file: data.controller.js ~ line 152 ~ tracker ~ time", time)
                        if (time >= 500 && time < 1200) {
                            if (d.status == "open") morning = 'TAKEN'
                            else morning = 'MISSED'
                        }

                        if (time >= 1200 && time < 1500) {
                            if (d.status == "open") afternoon = 'TAKEN'
                            else afternoon = 'MISSED'
                        }
                        if (time >= 1500 && time < 1900) {
                            if (d.status == "open") evening = 'TAKEN'
                            else evening = 'MISSED'
                        }
                        if (time >= 1900 && time <= 2300) {
                            if (d.status == "open") night = 'TAKEN'
                            else night = 'MISSED'
                        }
                    })
                }

            } else {

                morning = 'NOT AVAILABLE';
                afternoon = 'NOT AVAILABLE';
                evening = 'NOT AVAILABLE';
                night = 'NOT AVAILABLE';
            }

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

        const tillNow = (openTill / (openTill + missedTill) * 100) ? (openTill / (openTill + missedTill) * 100).toFixed(2) : 0

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

        const tillMonth = (openTillMonth / (openTillMonth + missedTillMonth) * 100) ? (openTillMonth / (openTillMonth + missedTillMonth) * 100).toFixed(2) : 0

        return successResponse(req, res, { morning, afternoon, evening, night, tillNow, tillMonth });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};



export const report = async (req, res) => {
    try {
        
        const { role } = req.user;
        
        let userId = req.user.userId;

        if (role == "caretaker") {
          let userCareTakerMapping = await UserCareTakerMappings.findOne({
            where: {
              caretaker_id: userId,
            },
          });
          
          userId = userCareTakerMapping.patient_id;
        } 

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

        const adherencePercentage = (open / (open + missed) * 100) ? ((open / (open + missed) * 100)).toFixed(2) : 0

        return successResponse(req, res, { open, missed, adherencePercentage });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};
