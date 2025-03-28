import CourseReferenceService from "../services/courseReference.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class CourseReferenceController {
  _courseReferenceService = new CourseReferenceService();

  getAllCourseReferences = async (req, res) => {
    try {
      const queryData = req.query;
      const result = await this._courseReferenceService.getAllCourseReferences(
        queryData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "All courseReferences data fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  createCourseReference = async (req, res) => {
    try {
      const courseReferenceData = req.body;
      const result = await this._courseReferenceService.createCourseReference(
        courseReferenceData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "CourseReference created successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateCourseReference = async (req, res) => {
    try {
      const courseReferenceData = req.body;
      const course_reference_id = req.params.course_reference_id;
      const result = await this._courseReferenceService.updateCourseReference(
        course_reference_id,
        courseReferenceData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "CourseReference updated successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deleteCourseReference = async (req, res) => {
    try {
      const course_reference_id = req.params.course_reference_id;
      const result = await this._courseReferenceService.deleteCourseReference(
        course_reference_id,
      );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  restoreCourseReferenceAccount = async (req, res) => {
    try {
      const course_reference_id = req.params.course_reference_id;
      const result =
        await this._courseReferenceService.restoreCourseReferenceAccount(
          course_reference_id,
        );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default CourseReferenceController;
