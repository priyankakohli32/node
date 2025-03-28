import { Router } from "express";
import ScriptController from "../controllers/script.controller.js";
import {
  bodySchemaValidator,
  queryParamsValidator,
} from "../middlewares/schema.validator.js";
import {
  createScriptSchema,
  getAllScriptsQuerySchema,
  updateScriptSchema,
} from "../schemas/script.js";
import { check_permissions } from "../middlewares/check_role.middleware.js";

const scriptRouter = Router({ mergeParams: true });

const scriptController = new ScriptController();

scriptRouter.get(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  queryParamsValidator(getAllScriptsQuerySchema),
  scriptController.getAllScripts,
);

scriptRouter.post(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(createScriptSchema),
  scriptController.createScript,
);

scriptRouter.patch(
  "/:script_id",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(updateScriptSchema),
  scriptController.updateScript,
);

scriptRouter.delete(
  "/:script_id",
  check_permissions(["ADMIN"]),
  scriptController.deleteScript,
);

scriptRouter.post(
  "/restore/:script_id",
  check_permissions(["ADMIN"]),
  scriptController.restoreScript,
);

export default scriptRouter;
