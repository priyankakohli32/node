import LectureService from "../services/lecture.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class LectureController {
  _lectureService = new LectureService();

  getAllLectures = async (req, res) => {
    try {
      const queryData = req.query;
      const result = await this._lectureService.getAllLectures(queryData);
      return res
        .status(200)
        .send(buildResponse(result, "All lectures data fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  getAllLecturesTitle = async (req, res) => {
    try {
      const course_id = req.params.course_id;
      const result = await this._lectureService.getAllLecturesTitle(course_id);
      return res
        .status(200)
        .send(buildResponse(result, "Lectures Title fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  createLecture = async (req, res) => {
    try {
      const lectureData = req.body;
      const result = await this._lectureService.createLecture(lectureData);
      return res
        .status(200)
        .send(buildResponse(result, "Lecture created successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateLecture = async (req, res) => {
    try {
      const lectureData = req.body;
      const lecture_id = req.params.lecture_id;
      const result = await this._lectureService.updateLecture(
        lecture_id,
        lectureData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "Lecture updated successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deleteLecture = async (req, res) => {
    try {
      const lecture_id = req.params.lecture_id;
      const result = await this._lectureService.deleteLecture(lecture_id);
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  restoreLectureAccount = async (req, res) => {
    try {
      const lecture_id = req.params.lecture_id;
      const result = await this._lectureService.restoreLectureAccount(
        lecture_id,
      );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  swapLecture = async (req, res) => {
    try {
      const { action } = req.body;
      const lecture_id = req.params.lecture_id;
      const result = await this._lectureService.swapLecture(lecture_id, action);
      return res
        .status(200)
        .send(buildResponse(result, "Lecture swaped successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default LectureController;
