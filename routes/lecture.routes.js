import { Router } from "express";
import LectureController from "../controllers/lecture.controller.js";
import {
  bodySchemaValidator,
  queryParamsValidator,
} from "../middlewares/schema.validator.js";
import {
  createLectureSchema,
  getAllLecturesQuerySchema,
  swapLectureSchema,
  updateLectureSchema,
} from "../schemas/lecture.js";
import { check_permissions } from "../middlewares/check_role.middleware.js";

const lectureRouter = Router({ mergeParams: true });

const lectureController = new LectureController();

lectureRouter.get(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  queryParamsValidator(getAllLecturesQuerySchema),
  lectureController.getAllLectures,
);

lectureRouter.get(
  "/title/:course_id",
  check_permissions(["ADMIN", "MENTOR"]),
  lectureController.getAllLecturesTitle,
);

lectureRouter.post(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(createLectureSchema),
  lectureController.createLecture,
);

lectureRouter.patch(
  "/:lecture_id",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(updateLectureSchema),
  lectureController.updateLecture,
);

lectureRouter.delete(
  "/:lecture_id",
  check_permissions(["ADMIN"]),
  lectureController.deleteLecture,
);

lectureRouter.post(
  "/restore/:lecture_id",
  check_permissions(["ADMIN"]),
  lectureController.restoreLectureAccount,
);

lectureRouter.patch(
  "/swap/:lecture_id",
  check_permissions(["ADMIN"]),
  bodySchemaValidator(swapLectureSchema),
  lectureController.swapLecture,
);

export default lectureRouter;
