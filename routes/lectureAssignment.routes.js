import { Router } from "express";
import LectureAssignmentController from "../controllers/lectureAssignment.controller.js";
import {
  bodySchemaValidator,
  queryParamsValidator,
} from "../middlewares/schema.validator.js";
import {
  createLectureAssignmentSchema,
  getAllLectureAssignmentsQuerySchema,
  updateLectureAssignmentSchema,
} from "../schemas/lectureAssignment.js";
import { check_permissions } from "../middlewares/check_role.middleware.js";

const lectureAssignmentRouter = Router({ mergeParams: true });

const lectureAssignmentController = new LectureAssignmentController();

lectureAssignmentRouter.get(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  queryParamsValidator(getAllLectureAssignmentsQuerySchema),
  lectureAssignmentController.getAllLectureAssignments,
);

lectureAssignmentRouter.post(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(createLectureAssignmentSchema),
  lectureAssignmentController.createLectureAssignment,
);

lectureAssignmentRouter.patch(
  "/:lecture_assignment_id",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(updateLectureAssignmentSchema),
  lectureAssignmentController.updateLectureAssignment,
);

lectureAssignmentRouter.delete(
  "/:lecture_assignment_id",
  check_permissions(["ADMIN"]),
  lectureAssignmentController.deleteLectureAssignment,
);

lectureAssignmentRouter.post(
  "/restore/:lecture_assignment_id",
  check_permissions(["ADMIN"]),
  lectureAssignmentController.restoreLectureAssignment,
);

export default lectureAssignmentRouter;
