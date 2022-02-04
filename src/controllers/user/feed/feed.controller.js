import { errorResponse, successResponse } from '../../../helpers';
import { Feed } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');

export const findById = async (req, res) => {
    try {
        const id = req.params.id;
        const feed = await Feed.findOne({
            where: {
                id
            },
        });
        if (!feed) {
            throw new Error('Feed do not exist');
        }
        return successResponse(req, res, { feed });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};

export const all = async (req, res) => {
    try {

        let searchFilter = null;

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

        const page = req.query.page || 1;
        const limit = 10;
        const sortOrder = sort == -1 ? 'ASC' : 'DESC';
        const feeds = await Feed.findAndCountAll({
            where: {
                [Op.and]: [{ status: true }, searchFilter === null ? undefined : { searchFilter }]
            },
            order: [['id', sortOrder]],
            offset: (page - 1) * limit,
            limit,
        });
        return successResponse(req, res, {
            feeds: {
                ...feeds,
                currentPage: parseInt(page),
                totalPage: Math.ceil(feeds.count / limit)
            }
        });
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
};