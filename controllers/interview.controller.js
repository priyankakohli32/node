import InterviewService from "../services/interview.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class InterviewController {
  _interviewService = new InterviewService();

  getAllInterviews = async (req, res) => {
    try {
      const queryData = req.query;
      const result = await this._interviewService.getAllInterviews(queryData);
      return res
        .status(200)
        .send(buildResponse(result, "All interviews data fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  createInterview = async (req, res) => {
    try {
      const interviewData = req.body;
      const result = await this._interviewService.createInterview(interviewData);
      return res
        .status(200)
        .send(buildResponse(result, "Interview created successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateInterview = async (req, res) => {
    try {
      const interviewData = req.body;
      const interview_id = req.params.interview_id;
      const result = await this._interviewService.updateInterview(
        interview_id,
        interviewData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "Interview updated successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deleteInterview = async (req, res) => {
    try {
      const interview_id = req.params.interview_id;
      const result = await this._interviewService.deleteInterview(interview_id);
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  restoreInterview = async (req, res) => {
    try {
      const interview_id = req.params.interview_id;
      const result = await this._interviewService.restoreInterview(interview_id);
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default InterviewController;
