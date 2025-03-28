import { Router } from "express";
import CourseController from "../controllers/course.controller.js";
import {
  bodySchemaValidator,
  queryParamsValidator,
} from "../middlewares/schema.validator.js";
import {
  createCourseSchema,
  getAllCoursesQuerySchema,
  swapCourseSchema,
  updateCourseSchema,
} from "../schemas/course.js";
import { check_permissions } from "../middlewares/check_role.middleware.js";

const courseRouter = Router({ mergeParams: true });

const courseController = new CourseController();

courseRouter.get(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  queryParamsValidator(getAllCoursesQuerySchema),
  courseController.getAllCourses,
);

courseRouter.get(
  "/title",
  check_permissions(["ADMIN", "MENTOR"]),
  courseController.getAllCoursesTitle,
);

courseRouter.post(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(createCourseSchema),
  courseController.createCourse,
);

courseRouter.patch(
  "/:course_id",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(updateCourseSchema),
  courseController.updateCourse,
);

courseRouter.delete(
  "/:course_id",
  check_permissions(["ADMIN"]),
  courseController.deleteCourse,
);

courseRouter.post(
  "/restore/:course_id",
  check_permissions(["ADMIN"]),
  courseController.restoreCourseAccount,
);

courseRouter.patch(
  "/swap/:course_id",
  check_permissions(["ADMIN"]),
  bodySchemaValidator(swapCourseSchema),
  courseController.swapCourse,
);

export default courseRouter;
