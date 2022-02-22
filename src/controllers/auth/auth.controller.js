import axios from 'axios';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { errorResponse, successResponse, uniqueCode, uniqueId } from '../../helpers';
import { User, UserAlarm, UserCareTakerMappings, UserDoctorMappings } from '../../models';
const { Op } = require('sequelize')
const randomstring = require("randomstring");

export const register = async (req, res) => {
    try {
        let patient, doctor;
        const {
            firstName, lastName, age, gender, email, password, phone, city, role, reference_code, state
        } = req.body;
        if (process.env.IS_GOOGLE_AUTH_ENABLE === 'true') {
            if (!req.body.code) {
                throw new Error('code must be defined');
            }
            const { code } = req.body;
            const customUrl = `${process.env.GOOGLE_CAPTCHA_URL}?secret=${process.env.GOOGLE_CAPTCHA_SECRET_SERVER
                }&response=${code}`;
            const response = await axios({
                method: 'post',
                url: customUrl,
                data: {
                    secret: process.env.GOOGLE_CAPTCHA_SECRET_SERVER,
                    response: code,
                },
                config: { headers: { 'Content-Type': 'multipart/form-data' } },
            });
            if (!(response && response.data && response.data.success === true)) {
                throw new Error('Google captcha is not valid');
            }
        }

        const user = await User.scope('withSecretColumns').findOne({
            where: {
                [Op.or]: [{ email }, { phone }]
            },
        });
        if (user) {
            throw new Error('User already exists with same email or phone');
        }

        if (role == "user") {
            const doctorWithActivationCode = await User.findOne({
                where: {
                    reference_code,
                    role: 'doctor'
                },
            });
            if (!doctorWithActivationCode)
                throw new Error('Activation Code do not exist');
            doctor = doctorWithActivationCode;
        }

        if (role == "caretaker") {
            const userWithActivationCode = await User.findOne({
                where: {
                    reference_code,
                    role: 'user'
                },
            });
            if (!userWithActivationCode)
                throw new Error('Activation Code do not exist');

            const checkPatientAlreadyMapped = await UserCareTakerMappings.findOne({
                where: {
                    patient_id: userWithActivationCode.id,
                },
            });
            if (checkPatientAlreadyMapped)
                throw new Error('Patient already has a care giver');
            patient = userWithActivationCode;
        }

        const reqPass = crypto
            .createHash('md5')
            .update(password)
            .digest('hex');

        const payload = {
            email,
            firstName,
            lastName,
            age,
            password: reqPass,
            isVerified: false,
            verifyToken: uniqueId(),
            role,
            gender,
            reference_code: (role == "user" || role == "doctor") ? uniqueCode('lowercase', 4, 4, randomstring.generate(10)) : null,
            phone,
            city,
            state
        };

        const newUser = await User.create(payload);
        if (role == "caretaker") {
            const mappingPayload = {
                patient_id: patient.id,
                caretaker_id: newUser.id
            }
            console.log("mappingPayload", mappingPayload)
            const newUserCaretakerMapping = await UserCareTakerMappings.create(mappingPayload);
        }

        if (role == "user") {
            const doctorMappingPayload = {
                patient_id: newUser.id,
                doctor_id: doctor.id
            }
            console.log("doctorMappingPayload", doctorMappingPayload)
            const newUserDoctorMapping = await UserDoctorMappings.create(doctorMappingPayload);
        }


        return successResponse(req, res, { newUser });
    } catch (error) {
        console.log(error)
        return errorResponse(req, res, error.message);
    }
};

export const login = async (req, res) => {
    try {
        const email = req.body.email
        const user = await User.scope('withSecretColumns').findOne({
            where: { email },
        });
        if (!user) {
            throw new Error('Incorrect Email Id/Password');
        }
        const reqPass = crypto
            .createHash('md5')
            .update(req.body.password || '')
            .digest('hex');
        if (reqPass !== user.password) {
            throw new Error('Incorrect Email Id/Password');
        }
        const token = jwt.sign(
            {
                user: {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    createdAt: new Date(),
                },
            },
            process.env.SECRET,
        );
        delete user.dataValues.password;
        let alarm = await UserAlarm.findOne({
            limit: 1, where: {
                user_id: user.id
            },
            order: [['createdAt', 'DESC']]
        })

        let patient = null
        if (user.role == 'caretaker') {
            patient = await UserCareTakerMappings.findAll({
                where: {
                    caretaker_id: user.id
                },
                include: [{
                    model: User,
                    as: 'patient'
                }]
            })

            alarm = await UserAlarm.findOne({
                limit: 1, where: {
                    user_id: patient[0].patient_id
                },
                order: [['createdAt', 'DESC']]
            })
        }

        return successResponse(req, res, { user, token, alarm, patient });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};