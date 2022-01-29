import { errorResponse, successResponse } from '../../../helpers';
import { Feed } from '../../../models';
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const AWS = require('aws-sdk');
const { v4: uuidV4 } = require('uuid');
const busboy = require('busboy');
AWS.config.update({ accessKeyId: process.env.ACCESS_KEY_ID, secretAccessKey: process.env.SECRET_ACCESS_KEY });
const S3 = new AWS.S3();


export const create = async (req, res) => {
    try {
        const {
            name, title, description, shortDescription, url, type
        } = req.body;

        const payload = {
            name, title, description, shortDescription, url, type
        };

        const newFeed = await Feed.create(payload);
        return successResponse(req, res, {});
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
}

export const update = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            name, title, description, shortDescription, url, type
        } = req.body;

        const feed = await Feed.findOne({
            where: {
                id
            },
        });
        if (!feed) {
            throw new Error('Feed do not exist');
        }

        const payload = {
            name, title, description, shortDescription, url, type
        };

        const updatedFeed = await Feed.update(payload, { where: { id } });
        return successResponse(req, res, {});
    } catch (error) {
        console.log(error)
        return errorResponse(req, res, error.message);
    }
}

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
        const feeds = await Feed.findAndCountAll({
            where: {
                [Op.and]: [statusFilter === null ? undefined : { status: statusFilter }, searchFilter === null ? undefined : { searchFilter }]
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

export const fileUpload = (req, res) => {
    let chunks = [], fName, fType;
    const bb = busboy({ headers: req.headers });
    bb.on('file', (name, file, info) => {
        const { filename, encoding, mimeType } = info;
        if (mimeType != 'image/png' || mimeType != 'image/jpg' || mimeType != 'image/jpeg') {
            return errorResponse(req, res, "png/jpg/jpeg only allowed");
        }
        fName = filename.replace(/ /g, "_");
        fType = mimeType;
        file.on('data', function (data) {
            chunks.push(data)
        });
        file.on('end', function () {
            console.log('File [' + filename + '] Finished');
        });
    });
    bb.on('finish', function () {
        const userId = uuidV4();
        const params = {
            Bucket: process.env.S3_BUCKET,
            Key: `${userId}-${fName}`,
            Body: Buffer.concat(chunks),
            ACL: 'public-read',
            ContentType: fType
        }

        S3.upload(params, (err, s3res) => {
            if (err) {
                return errorResponse(req, res, err.message);
            } else {
                return successResponse(req, res, { url: s3res.Location });
            }
        });

    });
    req.pipe(bb);
};

