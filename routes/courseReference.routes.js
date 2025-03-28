import { Router } from "express";
import CourseReferenceController from "../controllers/courseReference.controller.js";
import {
  bodySchemaValidator,
  queryParamsValidator,
} from "../middlewares/schema.validator.js";
import {
  createCourseReferenceSchema,
  getAllCourseReferencesQuerySchema,
  updateCourseReferenceSchema,
} from "../schemas/courseReference.js";
import { check_permissions } from "../middlewares/check_role.middleware.js";

const courseReferenceRouter = Router({ mergeParams: true });

const courseReferenceController = new CourseReferenceController();

courseReferenceRouter.get(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  queryParamsValidator(getAllCourseReferencesQuerySchema),
  courseReferenceController.getAllCourseReferences,
);

courseReferenceRouter.post(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(createCourseReferenceSchema),
  courseReferenceController.createCourseReference,
);

courseReferenceRouter.patch(
  "/:course_reference_id",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(updateCourseReferenceSchema),
  courseReferenceController.updateCourseReference,
);

courseReferenceRouter.delete(
  "/:course_reference_id",
  check_permissions(["ADMIN"]),
  courseReferenceController.deleteCourseReference,
);

courseReferenceRouter.post(
  "/restore/:course_reference_id",
  check_permissions(["ADMIN"]),
  courseReferenceController.restoreCourseReferenceAccount,
);

export default courseReferenceRouter;
