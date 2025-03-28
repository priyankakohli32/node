import { Router } from "express";
import HealthModuleController from "../controllers/healthModule.controller.js";
import {
  bodySchemaValidator,
  queryParamsValidator,
} from "../middlewares/schema.validator.js";
import {
  createHealthModuleSchema,
  getAllHealthModulesQuerySchema,
  updateHealthModuleSchema,
} from "../schemas/healthModule.js";
import { check_permissions } from "../middlewares/check_role.middleware.js";

const healthModuleRouter = Router({ mergeParams: true });

const healthModuleController = new HealthModuleController();

healthModuleRouter.get(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  queryParamsValidator(getAllHealthModulesQuerySchema),
  healthModuleController.getAllHealthModules,
);

healthModuleRouter.post(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(createHealthModuleSchema),
  healthModuleController.createHealthModule,
);

healthModuleRouter.patch(
  "/:health_module_id",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(updateHealthModuleSchema),
  healthModuleController.updateHealthModule,
);

healthModuleRouter.delete(
  "/:health_module_id",
  check_permissions(["ADMIN"]),
  healthModuleController.deleteHealthModule,
);

healthModuleRouter.post(
  "/restore/:health_module_id",
  check_permissions(["ADMIN"]),
  healthModuleController.restoreHealthModule,
);

export default healthModuleRouter;
