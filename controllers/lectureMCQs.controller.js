import LectureMCQsService from "../services/lectureMCQs.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class LectureMCQsController {
  _lectureMCQsService = new LectureMCQsService();

  getAllLectureMCQs = async (req, res) => {
    try {
      const queryData = req.query;
      const result = await this._lectureMCQsService.getAllLectureMCQs(
        queryData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "All lectureMCQss data fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  createLectureMCQs = async (req, res) => {
    try {
      const lectureMCQsData = req.body;
      const result = await this._lectureMCQsService.createLectureMCQs(
        lectureMCQsData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "LectureMCQs created successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateLectureMCQs = async (req, res) => {
    try {
      const lectureMCQsData = req.body;
      const course_mcq_id = req.params.course_mcq_id;
      const result = await this._lectureMCQsService.updateLectureMCQs(
        course_mcq_id,
        lectureMCQsData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "LectureMCQs updated successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deleteLectureMCQs = async (req, res) => {
    try {
      const course_mcq_id = req.params.course_mcq_id;
      const result = await this._lectureMCQsService.deleteLectureMCQs(
        course_mcq_id,
      );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  restoreLectureMCQsAccount = async (req, res) => {
    try {
      const course_mcq_id = req.params.course_mcq_id;
      const result = await this._lectureMCQsService.restoreLectureMCQsAccount(
        course_mcq_id,
      );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default LectureMCQsController;
