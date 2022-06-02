import { errorResponse, successResponse } from '../../../helpers';
import { Medicine, ScheduleDose } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');

export const create = async (req, res) => {
    try {
        let {
            name, companyName
        } = req.body;

        name = name.replace(/(\w)(\w*)/g, (g0, g1, g2) => { return g1.toUpperCase() + g2.toLowerCase(); });
        companyName = companyName.replace(/(\w)(\w*)/g, (g0, g1, g2) => { return g1.toUpperCase() + g2.toLowerCase(); });

        const medicine = await Medicine.findOne({
            where: {
                [Op.and]: [{ name }, { companyName }]
            },
        });
        if (medicine) {
            throw new Error('Medicine exists');
        }

        const payload = {
            name, companyName
        };

        const createdMedicine = await Medicine.create(payload);
        const newMedicine = await Medicine.findOne({
            where: {
                name, companyName
            }
        })
        return successResponse(req, res, { newMedicine });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
}

export const update = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            name, companyName
        } = req.body;

        const medicine = await Medicine.findOne({
            where: {
                id
            },
        });
        if (!medicine) {
            throw new Error('Medicine do not exist');
        }

        const payload = {
            name, companyName
        };

        const updatedMedicine = await Medicine.update(payload, { where: { id } });
        return successResponse(req, res, {});
    } catch (error) {
        console.log(error)
        return errorResponse(req, res, error.message);
    }
}

export const findById = async (req, res) => {
    try {
        const id = req.params.id;
        const medicine = await Medicine.findOne({
            where: {
                id
            },
        });
        if (!medicine) {
            throw new Error('Medicine do not exist');
        }
        return successResponse(req, res, { medicine });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};

export const all = async (req, res) => {
    try {
        const page = req.query.page || 1;
        let searchFilter = null;
        if (req.query.search) {
            const search = req.query.search;

            searchFilter = {
                [Op.or]: [
                    sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('name')), { [Op.like]: `%${search}%` }
                    ),
                ]
            }
        }

        const limit = 1000;
        const medicines = await Medicine.findAndCountAll({
            where: searchFilter === null ? undefined : { searchFilter },
            order: [['createdAt', 'DESC'], ['id', 'ASC']],
            offset: (page - 1) * limit,
            limit,
        });
        return successResponse(req, res, {
            medicines: {
                ...medicines,
                currentPage: parseInt(page),
                totalPage: Math.ceil(medicines.count / limit)
            }
        });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};


export const statusUpdate = async (req, res) => {
    try {
        const id = req.params.id;

        const medicine = await Medicine.findOne({
            where: {
                id
            },
        });
        if (!medicine) {
            throw new Error('Medicine do not exist');
        }

        let payload = {
            status: !medicine.status
        };

        const updatedMedicine = await Medicine.update(payload, { where: { id } });
        medicine.status = !medicine.status
        return successResponse(req, res, { medicine });
    } catch (error) {
        console.log(error)
        return errorResponse(req, res, error.message);
    }
}