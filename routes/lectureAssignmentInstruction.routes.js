import { Router } from "express";
import LectureAssignmentInstructionController from "../controllers/lectureAssignmentInstruction.controller.js";
import {
  bodySchemaValidator,
  queryParamsValidator,
} from "../middlewares/schema.validator.js";
import {
  createLectureAssignmentInstructionSchema,
  getAllLectureAssignmentInstructionsQuerySchema,
  swapLectureAssignmentInstructionSchema,
  updateLectureAssignmentInstructionSchema,
} from "../schemas/lectureAssignmentInstruction.js";
import { check_permissions } from "../middlewares/check_role.middleware.js";

const lectureAssignmentInstructionRouter = Router({ mergeParams: true });

const lectureAssignmentInstructionController =
  new LectureAssignmentInstructionController();

lectureAssignmentInstructionRouter.get(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  queryParamsValidator(getAllLectureAssignmentInstructionsQuerySchema),
  lectureAssignmentInstructionController.getAllLectureAssignmentInstructions,
);

lectureAssignmentInstructionRouter.post(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(createLectureAssignmentInstructionSchema),
  lectureAssignmentInstructionController.createLectureAssignmentInstruction,
);

lectureAssignmentInstructionRouter.patch(
  "/:instruction_id",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(updateLectureAssignmentInstructionSchema),
  lectureAssignmentInstructionController.updateLectureAssignmentInstruction,
);

lectureAssignmentInstructionRouter.delete(
  "/:instruction_id",
  check_permissions(["ADMIN"]),
  lectureAssignmentInstructionController.deleteLectureAssignmentInstruction,
);

lectureAssignmentInstructionRouter.post(
  "/restore/:instruction_id",
  check_permissions(["ADMIN"]),
  lectureAssignmentInstructionController.restoreLectureAssignmentInstruction,
);


lectureAssignmentInstructionRouter.patch(
  "/swap/:lecture_assignment_instruction_id",
  check_permissions(["ADMIN"]),
  bodySchemaValidator(swapLectureAssignmentInstructionSchema),
  lectureAssignmentInstructionController.swapLectureAssignmentInstruction,
);


export default lectureAssignmentInstructionRouter;
