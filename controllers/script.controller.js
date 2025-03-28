import ScriptService from "../services/script.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class ScriptController {
  _scriptService = new ScriptService();

  getAllScripts = async (req, res) => {
    try {
      const queryData = req.query;
      const result = await this._scriptService.getAllScripts(queryData);
      return res
        .status(200)
        .send(buildResponse(result, "All scripts data fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  createScript = async (req, res) => {
    try {
      const scriptData = req.body;
      const result = await this._scriptService.createScript(scriptData);
      return res
        .status(200)
        .send(buildResponse(result, "Script created successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateScript = async (req, res) => {
    try {
      const scriptData = req.body;
      const script_id = req.params.script_id;
      const result = await this._scriptService.updateScript(
        script_id,
        scriptData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "Script updated successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deleteScript = async (req, res) => {
    try {
      const script_id = req.params.script_id;
      const result = await this._scriptService.deleteScript(script_id);
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  restoreScript = async (req, res) => {
    try {
      const script_id = req.params.script_id;
      const result = await this._scriptService.restoreScript(script_id);
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default ScriptController;
