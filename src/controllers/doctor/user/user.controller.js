import { errorResponse, successResponse } from '../../../helpers';
import { Adherence, Company, DeviceUserMapping, User } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const randomstring = require("randomstring");

export const all = async (req, res) => {

    try {

        let user_ids_mapped_company = [];

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
            user_ids_mapped_company = [
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
            user_ids_mapped_company = [
                ... (await DeviceUserMapping.findAll({
                    where: {
                        doctor_id
                    },
                    attributes: ['doctor_id'],
                    raw: true
                })),
            ].map(user => user.doctor_id);
        }

        const page = req.query.page || 1;
        const limit = 10;
        const sortOrder = sort == -1 ? 'ASC' : 'DESC';
        const users = await User.findAndCountAll({
            where: {
                [Op.and]: [{ role }, statusFilter === null ? undefined : { status: statusFilter }, searchFilter === null ? undefined : { searchFilter }, stateFilter === null ? undefined : { stateFilter }, {
                    id: {
                        [Op.in]: user_ids_mapped_company
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