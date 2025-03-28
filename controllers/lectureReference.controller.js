import LectureReferenceService from "../services/lectureReference.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class LectureReferenceController {
  _lectureReferenceService = new LectureReferenceService();

  getAllLectureReferences = async (req, res) => {
    try {
      const queryData = req.query;
      const result = await this._lectureReferenceService.getAllLectureReferences(
        queryData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "All lectureReferences data fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  createLectureReference = async (req, res) => {
    try {
      const lectureReferenceData = req.body;
      const result = await this._lectureReferenceService.createLectureReference(
        lectureReferenceData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "LectureReference created successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateLectureReference = async (req, res) => {
    try {
      const lectureReferenceData = req.body;
      const reference_id = req.params.reference_id;
      const result = await this._lectureReferenceService.updateLectureReference(
        reference_id,
        lectureReferenceData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "LectureReference updated successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deleteLectureReference = async (req, res) => {
    try {
      const reference_id = req.params.reference_id;
      const result = await this._lectureReferenceService.deleteLectureReference(
        reference_id,
      );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  restoreLectureReferenceAccount = async (req, res) => {
    try {
      const reference_id = req.params.reference_id;
      const result =
        await this._lectureReferenceService.restoreLectureReferenceAccount(
          reference_id,
        );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default LectureReferenceController;
