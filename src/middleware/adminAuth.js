import { errorResponse } from '../helpers';

const adminAuth = (req, res, next) => {
  if (req.user && req.user.phone /* && eq.user.role == "admin" */) {
    return next();
  }
  return errorResponse(req, res, "You don't have admin access", 401);
};

export default adminAuth;
