import { Router } from "express";
import InterviewController from "../controllers/interview.controller.js";
import {
  bodySchemaValidator,
  queryParamsValidator,
} from "../middlewares/schema.validator.js";
import {
  createInterviewSchema,
  getAllInterviewsQuerySchema,
  updateInterviewSchema,
} from "../schemas/interview.js";
import { check_permissions } from "../middlewares/check_role.middleware.js";

const interviewRouter = Router({ mergeParams: true });

const interviewController = new InterviewController();

interviewRouter.get(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  queryParamsValidator(getAllInterviewsQuerySchema),
  interviewController.getAllInterviews,
);

interviewRouter.post(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(createInterviewSchema),
  interviewController.createInterview,
);

interviewRouter.patch(
  "/:interview_id",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(updateInterviewSchema),
  interviewController.updateInterview,
);

interviewRouter.delete(
  "/:interview_id",
  check_permissions(["ADMIN"]),
  interviewController.deleteInterview,
);

interviewRouter.post(
  "/restore/:interview_id",
  check_permissions(["ADMIN"]),
  interviewController.restoreInterview,
);

export default interviewRouter;
