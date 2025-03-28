import LectureAssignmentInstructionService from "../services/lectureAssignmentInstruction.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class LectureAssignmentInstructionController {
  _lectureAssignmentInstructionService =
    new LectureAssignmentInstructionService();

  getAllLectureAssignmentInstructions = async (req, res) => {
    try {
      const queryData = req.query;
      const result =
        await this._lectureAssignmentInstructionService.getAllLectureAssignmentInstructions(
          queryData,
        );
      return res
        .status(200)
        .send(
          buildResponse(
            result,
            "All Lecture Assignment Instructions data fetched",
          ),
        );
    } catch (error) {
      errorHandler(res, error);
    }
  };

  createLectureAssignmentInstruction = async (req, res) => {
    try {
      const lectureAssignmentInstructionData = req.body;
      const result =
        await this._lectureAssignmentInstructionService.createLectureAssignmentInstruction(
          lectureAssignmentInstructionData,
        );
      return res
        .status(200)
        .send(
          buildResponse(
            result,
            "Lecture Assignment Instruction created successfully",
          ),
        );
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateLectureAssignmentInstruction = async (req, res) => {
    try {
      const lectureAssignmentInstructionData = req.body;
      const instruction_id = req.params.instruction_id;
      const result =
        await this._lectureAssignmentInstructionService.updateLectureAssignmentInstruction(
          instruction_id,
          lectureAssignmentInstructionData,
        );
      return res
        .status(200)
        .send(
          buildResponse(
            result,
            "Lecture Assignment Instruction updated successfully",
          ),
        );
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deleteLectureAssignmentInstruction = async (req, res) => {
    try {
      const instruction_id = req.params.instruction_id;
      const result =
        await this._lectureAssignmentInstructionService.deleteLectureAssignmentInstruction(
          instruction_id,
        );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  restoreLectureAssignmentInstruction = async (req, res) => {
    try {
      const instruction_id = req.params.instruction_id;
      const result =
        await this._lectureAssignmentInstructionService.restoreLectureAssignmentInstruction(
          instruction_id,
        );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  swapLectureAssignmentInstruction = async (req, res) => {
    try {
      const { action } = req.body;
      const lecture_assignment_instruction_id = req.params.lecture_assignment_instruction_id;
      const result = await this._lectureAssignmentInstructionService.swapLectureAssignmentInstruction(lecture_assignment_instruction_id, action);
      return res
        .status(200)
        .send(buildResponse(result, "Lecture Assignment Instruction swaped successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default LectureAssignmentInstructionController;
