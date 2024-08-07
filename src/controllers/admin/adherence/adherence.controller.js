import { errorResponse, getAge, successResponse } from '../../../helpers';
import { Adherence, DeviceUserMapping, Medicine, ScheduleDose, User } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');



export const adherenceData = async (req, res) => {
    try {
        let dateToFilter = null, stateFilter = null, genderFilter = null, ageFilter = null, companyFilter = null;

        let bucket_100_80 = 0;
        let bucket_80_50 = 0;
        let bucket_50_30 = 0;
        let bucket_30 = 0;
        let avg_adherence = 0;

        if (req.query.state) {
            const state = req.query.state;
            stateFilter = sequelize.where(
                sequelize.fn('LOWER', sequelize.col('state')), { [Op.like]: `%${state}%` }
            )
        }

        if (req.query.gender) {
            const gender = req.query.gender;
            if (gender == "male") {
                genderFilter = "male"
            } else {
                genderFilter = "female"
            }
        }

        if (req.query.company_id) {
            const company_id = req.query.company_id
            let user_ids_mapped_company = [
                ... (await DeviceUserMapping.findAll({
                    where: {
                        company_id
                    },
                    attributes: ['patient_id'],
                    raw: true
                })),
            ].map(user => user.patient_id);

            companyFilter = {
                id: {
                    [Op.in]: user_ids_mapped_company
                }
            }
        }

        let users = await User.findAll({
            where: {
                [Op.and]: [stateFilter === null ? undefined : { state: stateFilter }, genderFilter === null ? undefined : { gender: genderFilter }, { role: "user" },
                companyFilter === null ? undefined : { ...companyFilter }]
            },
            attributes: ["id", "dob"]
        });


        if (req.query.age) {
            const age = req.query.age;
            users = users.filter(u => {
                let dob = getAge(u.dob);
                console.log("🚀 ~ file: adherence.controller.js ~ line 45 ~ adherenceData ~ dob", dob)

                if (age == 1) return (dob >= 70)

                if (age == 2) return (dob >= 60 && dob < 70)

                if (age == 3) return (dob >= 50 && dob < 60)

                if (age == 4) return (dob >= 40 && dob < 50)

                if (age == 5) return (dob < 40)

                return true
            })
        }

        if (req.query.from && req.query.to) {
            const from = new Date(req.query.from).toISOString().split('T')[0];
            const to = new Date(req.query.to).toISOString().split('T')[0];
            dateToFilter =
            {
                [Op.between]: [from, to],
            }
        }

        let total_avg_adherence = 0;
        for (const u of users) {

            const adherence_open = await Adherence.findAndCountAll({
                where: {
                    [Op.and]: [{ status: 'open' }, dateToFilter === null ? undefined : { date: dateToFilter }, { patient_id: u.id }]
                }
            })

            const adherence_missed = await Adherence.findAndCountAll({
                where: {
                    [Op.and]: [{ status: 'missed' }, dateToFilter === null ? undefined : { date: dateToFilter }, { patient_id: u.id }]
                }
            })

            let total = adherence_open.count + adherence_missed.count
            let avg = (adherence_open.count / total) * 100
            total_avg_adherence = total_avg_adherence + avg;
            if (avg <= 100 && avg >= 80) bucket_100_80++;
            if (avg < 80 && avg >= 50) bucket_80_50++;
            if (avg < 50 && avg >= 30) bucket_50_30++;
            if (avg < 30 && avg > 0) bucket_30++;


        }

        avg_adherence = total_avg_adherence / users.length || 0

        return successResponse(req, res, {
            users,
            bucket_100_80,
            bucket_80_50,
            bucket_50_30,
            bucket_30,
            avg_adherence
        });

    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};