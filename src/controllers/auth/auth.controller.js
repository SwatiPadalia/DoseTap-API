import axios from 'axios';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { errorResponse, successResponse, uniqueCode, uniqueId } from '../../helpers';
import { User } from '../../models';
const { Op } = require('sequelize')

export const register = async (req, res) => {
    try {
        const {
            firstName, lastName, age, gender, email, password, phone, city, role, caretaker_code
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

        if (role == "caretaker") {
            const userWithActivationCode = await User.findOne({
                where: {
                    caretaker_code
                },
            });
            if (!userWithActivationCode)
                throw new Error('Activation Code do not exist');
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
            caretaker_code: role == "user" ? uniqueCode('lowercase', 4, 3, firstName) : null,
            phone,
            city
        };

        const newUser = await User.create(payload);
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
        return successResponse(req, res, { user, token });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};