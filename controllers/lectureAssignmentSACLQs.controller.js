import LectureAssignmentSACLQsService from "../services/lectureAssignmentSACLQs.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class LectureAssignmentSACLQsController {
  _lectureAssignmentSACLQsService = new LectureAssignmentSACLQsService();

  getAllLectureAssignmentSACLQs = async (req, res) => {
    try {
      const queryData = req.query;
      const result =
        await this._lectureAssignmentSACLQsService.getAllLectureAssignmentSACLQs(
          queryData,
        );
      return res
        .status(200)
        .send(
          buildResponse(result, "All Lecture Assignment SACLQs data fetched"),
        );
    } catch (error) {
      errorHandler(res, error);
    }
  };

  createLectureAssignmentSACLQs = async (req, res) => {
    try {
      const lectureAssignmentSACLQsData = req.body;
      const result =
        await this._lectureAssignmentSACLQsService.createLectureAssignmentSACLQs(
          lectureAssignmentSACLQsData,
        );
      return res
        .status(200)
        .send(
          buildResponse(
            result,
            "Lecture Assignment SACLQs created successfully",
          ),
        );
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateLectureAssignmentSACLQs = async (req, res) => {
    try {
      const lectureAssignmentSACLQsData = req.body;
      const SACLQ_id = req.params.SACLQ_id;
      const result =
        await this._lectureAssignmentSACLQsService.updateLectureAssignmentSACLQs(
          SACLQ_id,
          lectureAssignmentSACLQsData,
        );
      return res
        .status(200)
        .send(
          buildResponse(
            result,
            "Lecture Assignment SACLQs updated successfully",
          ),
        );
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deleteLectureAssignmentSACLQs = async (req, res) => {
    try {
      const SACLQ_id = req.params.SACLQ_id;
      const result =
        await this._lectureAssignmentSACLQsService.deleteLectureAssignmentSACLQs(
          SACLQ_id,
        );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  restoreLectureAssignmentSACLQs = async (req, res) => {
    try {
      const SACLQ_id = req.params.SACLQ_id;
      const result =
        await this._lectureAssignmentSACLQsService.restoreLectureAssignmentSACLQs(
          SACLQ_id,
        );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  swapLectureAssignmentSACLQs = async (req, res) => {
    try {
      const { action } = req.body;
      const lecture_assignment_saclq_id = req.params.lecture_assignment_saclq_id;
      const result = await this._lectureAssignmentSACLQsService.swapLectureAssignmentSACLQs(lecture_assignment_saclq_id, action);
      return res
        .status(200)
        .send(buildResponse(result, "Lecture Assignment SACLQs swaped successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default LectureAssignmentSACLQsController;
