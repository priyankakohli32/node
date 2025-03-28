import { Router } from "express";
import SessionController from "../controllers/session.controller.js";
import {
  bodySchemaValidator,
  queryParamsValidator,
} from "../middlewares/schema.validator.js";
import {
  createSessionSchema,
  getAllSessionsQuerySchema,
  updateSessionSchema,
} from "../schemas/session.js";
import { check_permissions } from "../middlewares/check_role.middleware.js";

const sessionRouter = Router({ mergeParams: true });

const sessionController = new SessionController();

sessionRouter.get(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  queryParamsValidator(getAllSessionsQuerySchema),
  sessionController.getAllSessions,
);

sessionRouter.post(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(createSessionSchema),
  sessionController.createSession,
);

sessionRouter.patch(
  "/:session_id",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(updateSessionSchema),
  sessionController.updateSession,
);

sessionRouter.delete(
  "/:session_id",
  check_permissions(["ADMIN"]),
  sessionController.deleteSession,
);

sessionRouter.post(
  "/restore/:session_id",
  check_permissions(["ADMIN"]),
  sessionController.restoreSession,
);

export default sessionRouter;
