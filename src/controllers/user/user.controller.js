import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { errorResponse, successResponse } from '../../helpers';
import { User } from '../../models';
const { Op } = require('sequelize')

export const profile = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findOne({ where: { id: userId } });
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
    return successResponse(req, res, { user, token });
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

export const update = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      firstName,
      lastName,
      gender,
      age,
      phone,
      city,
      state
    } = req.body;

    const user = await User.findOne({ where: { id: userId } });
    if (!user)
      throw new Error('User do not exist');

    const payload = {
      firstName,
      lastName,
      gender,
      age,
      phone,
      city,
      state
    }
    console.log("🚀 ~ file: user.controller.js ~ line 83 ~ update ~ payload", payload)
    const updated = await User.update(payload, { where: { id: userId } });
    const updatedUser = await User.findOne({ where: { id: userId } });
    return successResponse(req, res, { user: updatedUser });

  } catch (error) {
    const err = error.errors[0];
    return errorResponse(req, res, err.message);
  }
};
