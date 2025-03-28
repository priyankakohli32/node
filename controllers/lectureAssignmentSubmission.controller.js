import LectureAssignmentSubmissionService from "../services/lectureAssignmentSubmission.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class LectureAssignmentSubmissionController {
  _lectureAssignmentSubmissionService =
    new LectureAssignmentSubmissionService();

  getAllLectureAssignmentSubmission = async (req, res) => {
    try {
      const queryData = req.query;
      const result =
        await this._lectureAssignmentSubmissionService.getAllLectureAssignmentSubmission(
          queryData,
        );
      return res
        .status(200)
        .send(
          buildResponse(
            result,
            "All Lecture Assignment Submission data fetched",
          ),
        );
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateLectureAssignmentSubmission = async (req, res) => {
    try {
      const lectureAssignmentSubmissionData = req.body;
      const SACLQ_id = req.params.SACLQ_id;
      const result =
        await this._lectureAssignmentSubmissionService.updateLectureAssignmentSubmission(
          SACLQ_id,
          lectureAssignmentSubmissionData,
        );
      return res
        .status(200)
        .send(
          buildResponse(
            result,
            "Lecture Assignment Submission updated successfully",
          ),
        );
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default LectureAssignmentSubmissionController;
