import { Router } from "express";
import LectureReferenceController from "../controllers/lectureReference.controller.js";
import {
  bodySchemaValidator,
  queryParamsValidator,
} from "../middlewares/schema.validator.js";
import {
  createLectureReferenceSchema,
  getAllLectureReferencesQuerySchema,
  updateLectureReferenceSchema,
} from "../schemas/lectureReference.js";
import { check_permissions } from "../middlewares/check_role.middleware.js";

const lectureReferenceRouter = Router({ mergeParams: true });

const lectureReferenceController = new LectureReferenceController();

lectureReferenceRouter.get(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  queryParamsValidator(getAllLectureReferencesQuerySchema),
  lectureReferenceController.getAllLectureReferences,
);

lectureReferenceRouter.post(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(createLectureReferenceSchema),
  lectureReferenceController.createLectureReference,
);

lectureReferenceRouter.patch(
  "/:reference_id",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(updateLectureReferenceSchema),
  lectureReferenceController.updateLectureReference,
);

lectureReferenceRouter.delete(
  "/:reference_id",
  check_permissions(["ADMIN"]),
  lectureReferenceController.deleteLectureReference,
);

lectureReferenceRouter.post(
  "/restore/:reference_id",
  check_permissions(["ADMIN"]),
  lectureReferenceController.restoreLectureReferenceAccount,
);

export default lectureReferenceRouter;
