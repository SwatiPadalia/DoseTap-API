import { errorResponse, successResponse } from '../../../helpers';
import { Company, Device, DeviceCompanyMappings, DeviceUserMapping, User } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');


export const partialMapping = async (req, res) => {
    try {
        let searchDoctorFilter = null, searchPatientFilter = null, searchCompanyFilter = null, searchDeviceFilter = null;
        console.log('hey')
        const sort = req.query.sort || -1;

        if (req.query.search) {
            const search = req.query.search;
            searchDeviceFilter = {
                [Op.or]: [
                    sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('device.serialNumber')), { [Op.like]: `%${search}%` }
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

        console.log(searchDeviceFilter)
        const page = req.query.page || 1;
        const limit = 10;
        const sortOrder = sort == -1 ? 'ASC' : 'DESC';
        const deviceMappings = await DeviceCompanyMappings.findAndCountAll({
            include: [
                {
                    model: Device, as: 'device',
                    where: {
                        [Op.and]: [searchDeviceFilter === null ? undefined : { searchDeviceFilter }]
                    },
                },
                {
                    model: Company, as: 'company'
                }
            ],
            order: [['id', sortOrder]],
            offset: (page - 1) * limit,
            limit,
        });
        return successResponse(req, res, {
            deviceMappings: {
                ...deviceMappings,
                currentPage: parseInt(page),
                totalPage: Math.ceil(deviceMappings.count / limit)
            }
        });

    } catch (error) {
        console.log("🚀 ~ file: device-mapping.controller.js ~ line 56 ~ all ~ error", error)
        return errorResponse(req, res, error.message);
    }
};

export const completeMapping = async (req, res) => {
    try {
        let searchDoctorFilter = null, searchPatientFilter = null, searchCompanyFilter = null, searchDeviceFilter = null;
        console.log('hey')
        const sort = req.query.sort || -1;

        if (req.query.search) {
            const search = req.query.search;
            searchDeviceFilter = {
                [Op.or]: [
                    sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('device.serialNumber')), { [Op.like]: `%${search}%` }
                    ),
                    sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('company.name')), { [Op.like]: `%${search}%` }
                    ),
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
        const deviceMappings = await DeviceUserMapping.findAndCountAll({
            where: {
                patient_id: {
                    [Op.ne]: null
                }
            },
            include: [
                {
                    model: User, as: 'doctor',
                },
                {
                    model: User, as: 'patient',
                },
                {
                    model: Device, as: 'device',
                    where: {
                        [Op.and]: [searchDeviceFilter === null ? undefined : { searchDeviceFilter }]
                    },
                },
                {
                    model: Company, as: 'company',
                    where: {
                        [Op.and]: [searchDeviceFilter === null ? undefined : { searchDeviceFilter }]
                    },
                }
            ],
            order: [['id', sortOrder]],
            offset: (page - 1) * limit,
            limit,
        });
        return successResponse(req, res, {
            deviceMappings: {
                ...deviceMappings,
                currentPage: parseInt(page),
                totalPage: Math.ceil(deviceMappings.count / limit)
            }
        });

    } catch (error) {
        console.log("🚀 ~ file: device-mapping.controller.js ~ line 56 ~ all ~ error", error)
        return errorResponse(req, res, error.message);
    }
};

