import SessionService from "../services/session.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class SessionController {
  _sessionService = new SessionService();

  getAllSessions = async (req, res) => {
    try {
      const queryData = req.query;
      const result = await this._sessionService.getAllSessions(queryData);
      return res
        .status(200)
        .send(buildResponse(result, "All sessions data fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  createSession = async (req, res) => {
    try {
      const sessionData = req.body;
      if (req.auth.claim == "MENTOR") sessionData.mentor = req.auth.id;
      const result = await this._sessionService.createSession(sessionData);
      return res
        .status(200)
        .send(buildResponse(result, "Session created successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateSession = async (req, res) => {
    try {
      const sessionData = req.body;
      const session_id = req.params.session_id;
      const result = await this._sessionService.updateSession(
        session_id,
        sessionData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "Session updated successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deleteSession = async (req, res) => {
    try {
      const session_id = req.params.session_id;
      const result = await this._sessionService.deleteSession(session_id);
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  restoreSession = async (req, res) => {
    try {
      const session_id = req.params.session_id;
      const result = await this._sessionService.restoreSession(session_id);
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default SessionController;
