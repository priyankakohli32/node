import { Router } from "express";
import LectureMCQsController from "../controllers/lectureMCQs.controller.js";
import {
  bodySchemaValidator,
  queryParamsValidator,
} from "../middlewares/schema.validator.js";
import {
  createLectureMCQsSchema,
  getAllLectureMCQsQuerySchema,
  updateLectureMCQsSchema,
} from "../schemas/lectureMCQs.js";
import { check_permissions } from "../middlewares/check_role.middleware.js";

const lectureMCQsRouter = Router({ mergeParams: true });

const lectureMCQsController = new LectureMCQsController();

lectureMCQsRouter.get(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  queryParamsValidator(getAllLectureMCQsQuerySchema),
  lectureMCQsController.getAllLectureMCQs,
);

lectureMCQsRouter.post(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(createLectureMCQsSchema),
  lectureMCQsController.createLectureMCQs,
);

lectureMCQsRouter.patch(
  "/:course_mcq_id",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(updateLectureMCQsSchema),
  lectureMCQsController.updateLectureMCQs,
);

lectureMCQsRouter.delete(
  "/:course_mcq_id",
  check_permissions(["ADMIN"]),
  lectureMCQsController.deleteLectureMCQs,
);

lectureMCQsRouter.post(
  "/restore/:course_mcq_id",
  check_permissions(["ADMIN"]),
  lectureMCQsController.restoreLectureMCQsAccount,
);

export default lectureMCQsRouter;
