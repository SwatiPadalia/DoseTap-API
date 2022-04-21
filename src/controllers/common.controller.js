import { errorResponse, successResponse } from '../helpers';
import { states } from '../helpers/IndianStatesDistricts.json';
import mailSender from '../mail/sendEmail';


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


export const supportMail = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body
        const params = {
            emailBody: `Message from ${name} , ${email},  ${phone}, message ->> ${message}`,
            subject: 'Message From Portal',
            toEmail: 'contact@dosetap.com'
        }
        mailSender.sendMail(params);

        return successResponse(req, res, {});
    } catch (error) {
        console.log(error)
        return errorResponse(req, res, error.message);
    }
}


