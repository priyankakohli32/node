import LectureAssignmentService from "../services/lectureAssignment.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class LectureAssignmentController {
  _lectureAssignmentService = new LectureAssignmentService();

  getAllLectureAssignments = async (req, res) => {
    try {
      const queryData = req.query;
      const result =
        await this._lectureAssignmentService.getAllLectureAssignments(
          queryData,
        );
      return res
        .status(200)
        .send(buildResponse(result, "All lecture Assignments data fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  createLectureAssignment = async (req, res) => {
    try {
      const lectureAssignmentData = req.body;
      const result =
        await this._lectureAssignmentService.createLectureAssignment(
          lectureAssignmentData,
        );
      return res
        .status(200)
        .send(buildResponse(result, "Lecture Assignment created successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateLectureAssignment = async (req, res) => {
    try {
      const lectureAssignmentData = req.body;
      const lecture_assignment_id = req.params.lecture_assignment_id;
      const result =
        await this._lectureAssignmentService.updateLectureAssignment(
          lecture_assignment_id,
          lectureAssignmentData,
        );
      return res
        .status(200)
        .send(buildResponse(result, "Lecture Assignment updated successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deleteLectureAssignment = async (req, res) => {
    try {
      const lecture_assignment_id = req.params.lecture_assignment_id;
      const result =
        await this._lectureAssignmentService.deleteLectureAssignment(
          lecture_assignment_id,
        );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  restoreLectureAssignment = async (req, res) => {
    try {
      const lecture_assignment_id = req.params.lecture_assignment_id;
      const result =
        await this._lectureAssignmentService.restoreLectureAssignment(
          lecture_assignment_id,
        );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default LectureAssignmentController;
