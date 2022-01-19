import { errorResponse, successResponse } from '../../../helpers';
import { Medicine } from '../../../models';
const { Op } = require('sequelize')

export const create = async (req, res) => {
    try {
        const {
            name, companyName
        } = req.body;
        const medicine = await Medicine.findOne({
            where: {
                [Op.or]: [{ name }, { companyName }]
            },
        });
        if (medicine) {
            throw new Error('Medicine exists');
        }

        const payload = {
            name, companyName
        };

        const newCompany = await Medicine.create(payload);
        return successResponse(req, res, {});
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
        const limit = 10;
        const medicines = await Medicine.findAndCountAll({
            order: [['createdAt', 'DESC'], ['id', 'ASC']],
            offset: (page - 1) * limit,
            limit,
        });
        return successResponse(req, res, { medicines });
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