import { buildResponse } from "../common/utils.js";

export const bodySchemaValidator = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      res.status(400).send(buildResponse(null, "failure", error.issues));
    }
  };
};

export const queryParamsValidator = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync(req.query);
      return next();
    } catch (error) {
      res.status(400).send(buildResponse(null, "failure", error.issues));
    }
  };
};
