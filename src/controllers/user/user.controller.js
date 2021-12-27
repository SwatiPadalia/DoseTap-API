import crypto from 'crypto';
import { errorResponse, successResponse } from '../../helpers';
import { User } from '../../models';
const { Op } = require('sequelize')

export const profile = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findOne({ where: { id: userId } });
    return successResponse(req, res, { user });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    console.log(req.user);
    const { userId } = req.user;
    const user = await User.scope('withSecretColumns').findOne({
      where: { id: userId },
    });

    const reqPass = crypto
      .createHash('md5')
      .update(req.body.oldPassword)
      .digest('hex');
    if (reqPass !== user.password) {
      throw new Error('Old password is incorrect');
    }

    const newPass = crypto
      .createHash('md5')
      .update(req.body.newPassword)
      .digest('hex');

    await User.update({ password: newPass }, { where: { id: user.id } });
    return successResponse(req, res, {});
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
