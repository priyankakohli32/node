import { Router } from "express";
import LectureAssignmentSACLQsController from "../controllers/lectureAssignmentSACLQs.controller.js";
import {
  bodySchemaValidator,
  queryParamsValidator,
} from "../middlewares/schema.validator.js";
import {
  createLectureAssignmentSACLQsSchema,
  getAllLectureAssignmentSACLQsQuerySchema,
  swapLectureAssignmentSACLQsSchema,
  updateLectureAssignmentSACLQsSchema,
} from "../schemas/lectureAssignmentSACLQs.js";
import { check_permissions } from "../middlewares/check_role.middleware.js";

const lectureAssignmentSACLQsRouter = Router({ mergeParams: true });

const lectureAssignmentSACLQsController =
  new LectureAssignmentSACLQsController();

lectureAssignmentSACLQsRouter.get(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  queryParamsValidator(getAllLectureAssignmentSACLQsQuerySchema),
  lectureAssignmentSACLQsController.getAllLectureAssignmentSACLQs,
);

lectureAssignmentSACLQsRouter.post(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(createLectureAssignmentSACLQsSchema),
  lectureAssignmentSACLQsController.createLectureAssignmentSACLQs,
);

lectureAssignmentSACLQsRouter.patch(
  "/:SACLQ_id",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(updateLectureAssignmentSACLQsSchema),
  lectureAssignmentSACLQsController.updateLectureAssignmentSACLQs,
);

lectureAssignmentSACLQsRouter.delete(
  "/:SACLQ_id",
  check_permissions(["ADMIN"]),
  lectureAssignmentSACLQsController.deleteLectureAssignmentSACLQs,
);

lectureAssignmentSACLQsRouter.post(
  "/restore/:SACLQ_id",
  check_permissions(["ADMIN"]),
  lectureAssignmentSACLQsController.restoreLectureAssignmentSACLQs,
);


lectureAssignmentSACLQsRouter.patch(
  "/swap/:lecture_assignment_saclq_id",
  check_permissions(["ADMIN"]),
  bodySchemaValidator(swapLectureAssignmentSACLQsSchema),
  lectureAssignmentSACLQsController.swapLectureAssignmentSACLQs,
);


export default lectureAssignmentSACLQsRouter;
