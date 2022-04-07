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

export const getDoseTapDocuments = async (req, res) => {
    try {
        var document = {
            privacy: "https://dosetap-document.s3.ap-south-1.amazonaws.com/privacy.pdf",
            terms: "https://dosetap-document.s3.ap-south-1.amazonaws.com/terms.pdf",
            faq: "https://dosetap-document.s3.ap-south-1.amazonaws.com/terms.pdf",
        }
        return successResponse(req, res, { document });
    } catch (error) {
        console.log(error)
        return errorResponse(req, res, error.message);
    }
};


