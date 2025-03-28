import { ForbiddenError } from "../common/errors.js";
import { buildResponse } from "../common/utils.js";

const errorMiddleware = (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).send("Invalid token");
  } else if (err instanceof ForbiddenError) {
    res.status(403).send(buildResponse(null, err.message, "failure"));
  } else if (err.name === "ZodError") {
    res.status(400).send(buildResponse(null, err.issues, "failure"));
  } else {
    res
      .status(404)
      .send(buildResponse(null, `Not Found - ${req.originalUrl}`, "failure"));
  }
  next();
};

export default errorMiddleware;
