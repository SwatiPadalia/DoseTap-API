import { errorResponse } from '../helpers';

const companyAuth = (req, res, next) => {
  if (req.user && req.user.phone && req.user.role == "company") {
    return next();
  }
  return errorResponse(req, res, "You don't have company access", 401);
};

export default companyAuth;
