import { errorResponse, successResponse } from '../../../helpers';
import { Adherence, Company, DeviceUserMapping, User, UserCareTakerMappings } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const randomstring = require("randomstring");

export const all = async (req, res) => {

    try {

        let user_ids_mapped_doctor = [], patient_ids_mapped_doctor = [];

        const doctor_id = req.user.id;
        console.log("🚀 ~ file: user.controller.js ~ line 14 ~ all ~ doctor_id", doctor_id)

        let searchFilter = null, statusFilter = null, stateFilter = null;

        const role = req.query.role;

        if (role === undefined) {
            throw new Error('Role is required in query parameter');
        }

        const sort = req.query.sort || -1;

        if (req.query.search) {
            const search = req.query.search;

            searchFilter = {
                [Op.or]: [
                    sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('firstName')), { [Op.like]: `%${search}%` }
                    ),
                    sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('email')), { [Op.like]: `%${search}%` }
                    ),
                    sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('phone')), { [Op.like]: `%${search}%` }
                    )
                ]
            }
        }

        if (req.query.status) {
            const status = req.query.status;
            if (status == 1) {
                statusFilter = true
            } else {
                statusFilter = false
            }
        }

        if (req.query.state) {
            const state = req.query.state;
            stateFilter = {
                [Op.or]: [
                    sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('state')), { [Op.like]: `%${state}%` }
                    )
                ]
            }
        }

        if (role == "user") {
            user_ids_mapped_doctor = [
                ... (await DeviceUserMapping.findAll({
                    where: {
                        doctor_id
                    },
                    attributes: ['patient_id'],
                    raw: true
                })),
            ].map(user => user.patient_id);
        }

        if (role == "doctor") {
            user_ids_mapped_doctor = [
                ... (await DeviceUserMapping.findAll({
                    where: {
                        doctor_id
                    },
                    attributes: ['doctor_id'],
                    raw: true
                })),
            ].map(user => user.doctor_id);
        }

        if (role == "caretaker") {
            patient_ids_mapped_doctor = [
                ... (await DeviceUserMapping.findAll({
                    where: {
                        doctor_id
                    },
                    attributes: ['patient_id'],
                    raw: true
                })),
            ].map(user => user.patient_id);

            user_ids_mapped_doctor = [
                ... (await UserCareTakerMappings.findAll({
                    where: {
                        patient_id: {
                            [Op.in]: patient_ids_mapped_doctor
                        }
                    },
                    attributes: ['caretaker_id'],
                    raw: true
                })),
            ].map(user => user.caretaker_id);

        }

        const page = req.query.page || 1;
        const limit = 10;
        const sortOrder = sort == -1 ? 'ASC' : 'DESC';
        const users = await User.findAndCountAll({
            where: {
                [Op.and]: [{ role }, statusFilter === null ? undefined : { status: statusFilter }, searchFilter === null ? undefined : { searchFilter }, stateFilter === null ? undefined : { stateFilter }, {
                    id: {
                        [Op.in]: user_ids_mapped_doctor
                    }
                }]
            },
            include: [{ model: Company, as: 'company' }],
            order: [['id', sortOrder]],
            offset: (page - 1) * limit,
            limit,
        });

        if (role == "user") {
            let rows = await Promise.all(users.rows.flatMap(async u => {
                let adherence_open = await Adherence.findAndCountAll({
                    where: {
                        status: 'open',
                        patient_id: u.id
                    }
                })

                let adherence_missed = await Adherence.findAndCountAll({
                    where: {
                        status: 'missed',
                        patient_id: u.id
                    }
                })
                let total = (adherence_open.count + adherence_missed.count);

                let y = adherence_open.count / total;
                let adherence = y ? y * 100 : 0
                return { ...u.get({ plain: true }), adherence }
            }))
            users.rows = rows;
        }

        if (role == "doctor") {

            let rows = await Promise.all(users.rows.flatMap(async u => {

                let company_associated = await DeviceUserMapping.findOne({
                    where: {
                        doctor_id: u.id,
                    },
                    include: [{ model: Company, as: 'company' }]
                })

                return { ...u.get({ plain: true }), company_associated: company_associated != null ? company_associated.company.name : undefined }
            }))
            users.rows = rows;
        }

        return successResponse(req, res, {
            users: {
                ...users,
                currentPage: parseInt(page),
                totalPage: Math.ceil(users.count / limit)
            }
        });
    } catch (error) {
        console.log("🚀 ~ file: user.controller.js ~ line 221 ~ all ~ error", error)
        return errorResponse(req, res, error.message);
    }
};


export const caretakerMapping = async (req, res) => {

    try {
        let searchFilter = null;

        const doctor_id = req.user.id;

        const sort = req.query.sort || -1;

        if (req.query.search) {
            const search = req.query.search;

            searchFilter = {
                [Op.or]: [
                    sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('caretaker.firstName')), { [Op.like]: `%${search}%` }
                    ),
                    sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('caretaker.email')), { [Op.like]: `%${search}%` }
                    ),
                    sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('caretaker.phone')), { [Op.like]: `%${search}%` }
                    )
                ]
            }
        }

        if (req.query.status) {
            const status = req.query.status;
            if (status == 1) {
                statusFilter = true
            } else {
                statusFilter = false
            }
        }


        let patient_ids_mapped_doctor = [
            ... (await DeviceUserMapping.findAll({
                where: {
                    doctor_id
                },
                attributes: ['patient_id'],
                raw: true
            })),
        ].map(user => user.patient_id);

        console.log("🚀 ~ file: user.controller.js ~ line 229 ~ caretakerMapping ~ patient_ids_mapped_doctor", patient_ids_mapped_doctor)

        const page = req.query.page || 1;
        const limit = 10;
        const sortOrder = sort == -1 ? 'ASC' : 'DESC';
        const user_caretaker = await UserCareTakerMappings.findAndCountAll({
            where: {
                [Op.and]: [searchFilter === null ? undefined : { searchFilter }],
                patient_id: {
                    [Op.in]: patient_ids_mapped_doctor
                }
            },
            include: [{ model: User, as: 'patient' }, { model: User, as: 'caretaker' }],
            order: [['id', sortOrder]],
            offset: (page - 1) * limit,
            limit,
        });
        return successResponse(req, res, {
            users: {
                ...user_caretaker,
                currentPage: parseInt(page),
                totalPage: Math.ceil(user_caretaker.count / limit)
            }
        });
    } catch (error) {
        console.log("🚀 ~ file: user.controller.js ~ line 307 ~ caretakerMapping ~ error", error)

        return errorResponse(req, res, error.message);
    }
}
