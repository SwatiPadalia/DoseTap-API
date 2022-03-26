import { errorResponse } from '../helpers';

const doctorAuth = (req, res, next) => {
  if (req.user && req.user.phone && req.user.role == "doctor") {
    return next();
  }
  return errorResponse(req, res, "You don't have doctor access", 401);
};

export default doctorAuth;
