import crypto from 'crypto';
import { errorResponse, successResponse, uniqueCode, uniqueId } from '../../../helpers';
import { User, UserCareTakerMappings } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');

export const create = async (req, res) => {
    try {
        let patient;
        const {
            firstName, lastName, age, gender, email, password, phone, city, role = "patient", caretaker_code
        } = req.body;

        const user = await User.scope('withSecretColumns').findOne({
            where: {
                [Op.or]: [{ email }, { phone }]
            },
        });
        if (user) {
            throw new Error('User already exists with same email or phone');
        }

        if (role == "caretaker") {
            const userWithActivationCode = await User.findOne({
                where: {
                    caretaker_code
                },
            });
            if (!userWithActivationCode)
                throw new Error('Activation Code do not exist');
            patient = userWithActivationCode;
        }
        const reqPass = crypto
            .createHash('md5')
            .update(password)
            .digest('hex');

        let payload = {
            email,
            firstName,
            lastName,
            age,
            password: reqPass,
            isVerified: false,
            verifyToken: uniqueId(),
            role,
            caretaker_code: role == "user" ? uniqueCode('lowercase', 4, 3, firstName) : null,
            gender,
            age,
            phone,
            city
        };
        if (role == "patient") {
            payload.uniqueCode = uniqueCode('lowercase', 3, 3, firstName);
        }
        const newUser = await User.create(payload);

        console.log("role", role);
        if (role == "caretaker") {
            const mappingPayload = {
                patient_id: patient.id,
                caretaker_id: newUser.id
            }
            const newUserCaretakerMapping = await UserCareTakerMappings.create(mappingPayload);
        }
        return successResponse(req, res, { newUser });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
}

export const update = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            firstName, lastName, age, gender, email, password, phone, city, role, state
        } = req.body;

        const user = await User.scope('withSecretColumns').findOne({
            where: {
                id
            },
        });
        if (!user) {
            throw new Error('User do not exist');
        }

        let reqPass, payload;
        if (password) {
            console.log("sss")
            reqPass = crypto
                .createHash('md5')
                .update(password)
                .digest('hex');
            payload = {
                email,
                firstName,
                lastName,
                password: reqPass,
                role,
                gender,
                age,
                phone,
                city,
                state
            };
        } else {
            payload = {
                email,
                firstName,
                lastName,
                role,
                gender,
                age,
                phone,
                city,
                state
            };
        }

        const updatedUser = await User.update(payload, { where: { id } });
        return successResponse(req, res, {});
    } catch (error) {
        console.log(error)
        return errorResponse(req, res, error.message);
    }
}

export const statusUpdate = async (req, res) => {
    try {
        const id = req.params.id;

        const user = await User.scope('withSecretColumns').findOne({
            where: {
                id
            },
        });
        if (!user) {
            throw new Error('User do not exist');
        }

        let reqPass, payload;
        payload = {
            status: !user.status
        };

        const updatedUser = await User.update(payload, { where: { id } });

        user.status = !user.status
        return successResponse(req, res, { user });
    } catch (error) {
        console.log(error)
        return errorResponse(req, res, error.message);
    }
}

export const findById = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findOne({
            where: {
                id
            },
        });
        if (!user) {
            throw new Error('User do not exist');
        }
        return successResponse(req, res, { user });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};

export const all = async (req, res) => {

    try {
        let searchFilter = null, statusFilter = null;

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

        const page = req.query.page || 1;
        const limit = 10;
        const sortOrder = sort == -1 ? 'ASC' : 'DESC';
        const users = await User.findAndCountAll({
            where: {
                [Op.and]: [{ role }, statusFilter === null ? undefined : { status: statusFilter }, searchFilter === null ? undefined : { searchFilter }]
            },
            order: [['id', sortOrder]],
            offset: (page - 1) * limit,
            limit,
        });
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


