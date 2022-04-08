import { errorResponse, successResponse } from '../../../helpers';
export const resetDevice = async (req, res) => {
    try {
        return successResponse(req, res, {});
    } catch (error) {
        return errorResponse(req, res, error.message);
    }
}