import { Router } from "express";
import LectureContentController from "../controllers/lectureContent.controller.js";
import {
  bodySchemaValidator,
  queryParamsValidator,
} from "../middlewares/schema.validator.js";
import {
  createLectureContentSchema,
  getAllLectureContentsQuerySchema,
  swapLectureContentSchema,
  updateLectureContentSchema,
} from "../schemas/lectureContent.js";
import { check_permissions } from "../middlewares/check_role.middleware.js";

const lectureContentRouter = Router({ mergeParams: true });

const lectureContentController = new LectureContentController();

lectureContentRouter.get(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  queryParamsValidator(getAllLectureContentsQuerySchema),
  lectureContentController.getAllLectureContents,
);

lectureContentRouter.post(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(createLectureContentSchema),
  lectureContentController.createLectureContent,
);

lectureContentRouter.patch(
  "/:content_id",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(updateLectureContentSchema),
  lectureContentController.updateLectureContent,
);

lectureContentRouter.delete(
  "/:content_id",
  check_permissions(["ADMIN"]),
  lectureContentController.deleteLectureContent,
);

lectureContentRouter.post(
  "/restore/:content_id",
  check_permissions(["ADMIN"]),
  lectureContentController.restoreLectureContentAccount,
);

lectureContentRouter.patch(
  "/swap/:lecture_content_id",
  check_permissions(["ADMIN"]),
  bodySchemaValidator(swapLectureContentSchema),
  lectureContentController.swapLectureContent,
);

export default lectureContentRouter;
