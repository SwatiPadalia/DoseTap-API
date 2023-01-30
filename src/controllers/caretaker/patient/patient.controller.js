import { errorResponse, successResponse } from "../../../helpers";
const { User, UserCareTakerMappings } = require('../../../models');

export const patientTagedToCaretaker = async (req, res) => {
    try {
        const { userId } = req.user;
        const user_caretaker = await UserCareTakerMappings.findOne({
            where: {
                caretaker_id: userId
            }
        })
        const patient_id = user_caretaker.patient_id;
        const patient = await User.findOne({
            where: {
                id: patient_id
            }
        })
        return successResponse(req, res, { patient });
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, error.message);
    }
}