import { errorResponse, successResponse } from '../../../helpers';
import { Company } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');

export const create = async (req, res) => {
    try {
        const {
            name
        } = req.body;
        const company = await Company.findOne({
            where: { name },
        });
        if (company) {
            throw new Error('Company exists');
        }

        const payload = {
            name,
        };

        const newCompany = await Company.create(payload);
        return successResponse(req, res, {});
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
}

export const update = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            name
        } = req.body;

        const company = await Company.findOne({
            where: {
                id
            },
        });
        if (!company) {
            throw new Error('Company do not exist');
        }

        const payload = {
            name
        };

        const updatedCompany = await Device.update(payload, { where: { id } });
        return successResponse(req, res, {});
    } catch (error) {
        console.log(error)
        return errorResponse(req, res, error.message);
    }
}

export const findById = async (req, res) => {
    try {
        const id = req.params.id;
        const company = await Company.findOne({
            where: {
                id
            },
        });
        if (!company) {
            throw new Error('Company do not exist');
        }
        return successResponse(req, res, { device });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};

export const all = async (req, res) => {
    try {

        let searchFilter = null, statusFilter = null;

        const sort = req.query.sort || -1;

        if (req.query.search) {
            const search = req.query.search;

            searchFilter = {
                [Op.or]: [
                    sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('name')), { [Op.like]: `%${search}%` }
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


        const page = req.query.page || 1;
        const limit = 10;
        const sortOrder = sort == -1 ? 'ASC' : 'DESC';
        const companies = await Company.findAndCountAll({
            where: {
                [Op.and]: [statusFilter === null ? undefined : { status: statusFilter }, searchFilter === null ? undefined : { searchFilter }]
            },
            order: [['id', sortOrder]],
            offset: (page - 1) * limit,
            limit,
        });
        return successResponse(req, res, {
            companies: {
                ...companies,
                currentPage: parseInt(page),
                totalPage: Math.ceil(companies.count / limit)
            }
        });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};