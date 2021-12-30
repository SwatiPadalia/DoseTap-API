import crypto from 'crypto';
import { errorResponse, successResponse } from '../../helpers';
import { User } from '../../models';
const { Op } = require('sequelize')

export const scheduleDose = async (req, res) => {
  try {
    const { userId } = req.user;
    
    

    return successResponse(req, res, { user });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};