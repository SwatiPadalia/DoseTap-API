import { errorResponse, successResponse } from '../../../helpers';
const { Op } = require('sequelize');
const { ScheduleDose, Medicine, User } = require('../../../models');
const _ = require('lodash')

export const allMedicine = async (req, res) => {

    try {
        const patient_id = req.params.id;

        const page = req.query.page || 1;
        const limit = 10;

        const doses = await ScheduleDose.findAll({
            where: {
                patient_id
            },
            include: [{ model: Medicine, as: 'medicineDetails' }]
        });
        let medicines = [...(_.uniqBy(doses, function (e) {
            return e.medicineDetails.id;
        }))].map(d => {
            return {
                id: d.medicineDetails.id,
                name: d.medicineDetails.name,
                companyName: d.medicineDetails.companyName
            }
        });

        return successResponse(req, res, {
            medicines:
            {
                count: medicines.length,
                rows: medicines,
                currentPage: parseInt(page),
                totalPage: Math.ceil(medicines.length / limit)
            }
        });

        return successResponse(req, res, { medicines });
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, error.message);
    }
}