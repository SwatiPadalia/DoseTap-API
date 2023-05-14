import { errorResponse, successResponse, uniqueCode } from '../../../helpers';
import { ReferenceCodes } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const randomstring = require("randomstring");



export const create = async (req, res) => {
    try {
        const {
            description
        } = req.body;

        const payload = {
            code: uniqueCode('lowercase', 4, 4, randomstring.generate(10)),
            description
        };

        const referralCode = await ReferenceCodes.create(payload);
        return successResponse(req, res, {});
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
}

export const all = async (req, res) => {
    try {

        let searchFilter = null, statusFilter = null;

        const sort = req.query.sort || -1;

        if (req.query.search) {
            const search = req.query.search;

            searchFilter = {
                [Op.or]: [
                    sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('code')), { [Op.like]: `%${search}%` }
                    ),
                    sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('description')), { [Op.like]: `%${search}%` }
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
        const referral_codes = await ReferenceCodes.findAndCountAll({
            where: {
                [Op.and]: [statusFilter === null ? undefined : { status: statusFilter }, searchFilter === null ? undefined : { searchFilter }]
            },
            order: [['id', sortOrder]],
            offset: (page - 1) * limit,
            limit,
        });
        return successResponse(req, res, {
            referral_codes: {
                ...referral_codes,
                currentPage: parseInt(page),
                totalPage: Math.ceil(referral_codes.count / limit)
            }
        });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};

export const statusUpdate = async (req, res) => {
    try {
        const id = req.params.id;

        const referralCode = await ReferenceCodes.findOne({
            where: {
                id
            },
        });
        if (!referralCode) {
            throw new Error('Referral Code do not exist');
        }

        let payload = {
            status: !referralCode.status
        };

        const updated = await ReferralCodes.update(payload, { where: { id } });

        referralCode.status = !referralCode.status
        return successResponse(req, res, { referralCode });
    } catch (error) {
        console.log(error)
        return errorResponse(req, res, error.message);
    }
}

