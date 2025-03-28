import { Router } from "express";
import CourseModuleController from "../controllers/courseModule.controller.js";
import {
  bodySchemaValidator,
  queryParamsValidator,
} from "../middlewares/schema.validator.js";
import {
  createCourseModuleSchema,
  getAllCourseModulesQuerySchema,
  swapCourseModuleSchema,
  updateCourseModuleSchema,
} from "../schemas/courseModule.js";
import { check_permissions } from "../middlewares/check_role.middleware.js";

const courseModuleRouter = Router({ mergeParams: true });

const courseModuleController = new CourseModuleController();

courseModuleRouter.get(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  queryParamsValidator(getAllCourseModulesQuerySchema),
  courseModuleController.getAllCourseModules,
);

courseModuleRouter.get(
  "/title/:course_id",
  check_permissions(["ADMIN", "MENTOR"]),
  courseModuleController.getAllCourseModulesTitle,
);

courseModuleRouter.post(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(createCourseModuleSchema),
  courseModuleController.createCourseModule,
);

courseModuleRouter.patch(
  "/:course_module_id",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(updateCourseModuleSchema),
  courseModuleController.updateCourseModule,
);

courseModuleRouter.delete(
  "/:course_module_id",
  check_permissions(["ADMIN"]),
  courseModuleController.deleteCourseModule,
);

courseModuleRouter.post(
  "/restore/:course_module_id",
  check_permissions(["ADMIN"]),
  courseModuleController.restoreCourseModuleAccount,
);

courseModuleRouter.patch(
  "/swap/:course_module_id",
  check_permissions(["ADMIN"]),
  bodySchemaValidator(swapCourseModuleSchema),
  courseModuleController.swapCourseModule,
);

export default courseModuleRouter;
