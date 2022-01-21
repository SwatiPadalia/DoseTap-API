import { errorResponse, successResponse } from '../helpers';
import { states } from '../helpers/IndianStatesDistricts.json';

export const getStates = async (req, res) => {
    try {
        return successResponse(req, res, { states });
    } catch (error) {
        console.log(error)
        return errorResponse(req, res, error.message);
    }
};
