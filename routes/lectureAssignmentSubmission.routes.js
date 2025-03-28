import { Router } from "express";
import LectureAssignmentSubmissionController from "../controllers/lectureAssignmentSubmission.controller.js";
import {
  bodySchemaValidator,
  queryParamsValidator,
} from "../middlewares/schema.validator.js";
import {
  getAllLectureAssignmentSubmissionQuerySchema,
  updateLectureAssignmentSubmissionSchema,
} from "../schemas/lectureAssignmentSubmission.js";
import { check_permissions } from "../middlewares/check_role.middleware.js";

const lectureAssignmentSubmissionRouter = Router({ mergeParams: true });

const lectureAssignmentSubmissionController =
  new LectureAssignmentSubmissionController();

lectureAssignmentSubmissionRouter.get(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  queryParamsValidator(getAllLectureAssignmentSubmissionQuerySchema),
  lectureAssignmentSubmissionController.getAllLectureAssignmentSubmission,
);

lectureAssignmentSubmissionRouter.patch(
  "/:SACLQ_id",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(updateLectureAssignmentSubmissionSchema),
  lectureAssignmentSubmissionController.updateLectureAssignmentSubmission,
);

export default lectureAssignmentSubmissionRouter;
