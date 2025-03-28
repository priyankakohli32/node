import { buildResponse } from "../common/utils.js";

export const check_permissions = (ROLES) => {
  return async (req, res, next) => {
    for (let ROLE in ROLES)
      if (req.auth.claims === { ADMIN: 1, MENTOR: 2, STUDENT: 3 }[ROLE]) {
        next();
        return;
      }
    res.status(403).send(buildResponse(null, "Access Denied", "failure"));
    return;
  };
};
