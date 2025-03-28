import LectureContentService from "../services/lectureContent.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class LectureContentController {
  _lectureContentService = new LectureContentService();

  getAllLectureContents = async (req, res) => {
    try {
      const queryData = req.query;
      const result = await this._lectureContentService.getAllLectureContents(
        queryData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "All lectureContents data fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  createLectureContent = async (req, res) => {
    try {
      const lectureContentData = req.body;
      const result = await this._lectureContentService.createLectureContent(
        lectureContentData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "LectureContent created successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateLectureContent = async (req, res) => {
    try {
      const lectureContentData = req.body;
      const content_id = req.params.content_id;
      const result = await this._lectureContentService.updateLectureContent(
        content_id,
        lectureContentData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "LectureContent updated successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deleteLectureContent = async (req, res) => {
    try {
      const content_id = req.params.content_id;
      const result = await this._lectureContentService.deleteLectureContent(
        content_id,
      );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  restoreLectureContentAccount = async (req, res) => {
    try {
      const content_id = req.params.content_id;
      const result =
        await this._lectureContentService.restoreLectureContentAccount(
          content_id,
        );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  swapLectureContent = async (req, res) => {
    try {
      const { action } = req.body;
      const lecture_content_id = req.params.lecture_content_id;
      const result = await this._lectureContentService.swapLectureContent(
        lecture_content_id,
        action,
      );
      return res
        .status(200)
        .send(buildResponse(result, "Lecture swaped successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default LectureContentController;
