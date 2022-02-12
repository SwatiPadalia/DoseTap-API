import { errorResponse, successResponse } from '../../../helpers';
import { Medicine } from '../../../models';
const { Op } = require('sequelize')
const sequelize = require('sequelize');
const fs = require("fs");
const csv = require("fast-csv");

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
        const medicines = await Medicine.findAndCountAll({
            where: {
                [Op.and]: [statusFilter === null ? undefined : { status: statusFilter }, searchFilter === null ? undefined : { searchFilter }]
            },
            order: [['createdAt', 'DESC'], ['id', 'ASC']],
            offset: (page - 1) * limit,
            limit,
        });
        return successResponse(req, res, {
            medicines:
            {
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

export const csvBulkImport = async (req, res) => {
    console.log('I am called')
    try {
        if (req.file == undefined) {
            return errorResponse(req, res, 'Please upload a CSV file!');
        }

        let medicines = [];
        let path = __basedir + "/uploads/" + req.file.filename;

        fs.createReadStream(path)
            .pipe(csv.parse({ headers: true }))
            .on("error", (error) => {
                throw error.message;
            })
            .on("data", (row) => {
                console.log("🚀 ~ file: medicine.controller.js ~ line 171 ~ .on ~ row", row)
                medicines.push(row);
            })
            .on("end", () => {
                Medicine.bulkCreate(medicines)
                    .then(() => {
                        return successResponse(req, res, {});
                    })
                    .catch((error) => {
                        return errorResponse(req, res, "Fail to import data into database!");
                    });
            });
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, error.message);
    }
}