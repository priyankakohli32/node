import HealthModuleService from "../services/healthModule.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class HealthModuleController {
  _healthModuleService = new HealthModuleService();

  getAllHealthModules = async (req, res) => {
    try {
      const queryData = req.query;
      const result = await this._healthModuleService.getAllHealthModules(queryData);
      return res
        .status(200)
        .send(buildResponse(result, "All healthModules data fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  createHealthModule = async (req, res) => {
    try {
      const healthModuleData = req.body;
      const result = await this._healthModuleService.createHealthModule(healthModuleData);
      return res
        .status(200)
        .send(buildResponse(result, "HealthModule created successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateHealthModule = async (req, res) => {
    try {
      const healthModuleData = req.body;
      const health_module_id = req.params.health_module_id;
      const result = await this._healthModuleService.updateHealthModule(
        health_module_id,
        healthModuleData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "HealthModule updated successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deleteHealthModule = async (req, res) => {
    try {
      const health_module_id = req.params.health_module_id;
      const result = await this._healthModuleService.deleteHealthModule(health_module_id);
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  restoreHealthModule = async (req, res) => {
    try {
      const health_module_id = req.params.health_module_id;
      const result = await this._healthModuleService.restoreHealthModule(health_module_id);
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default HealthModuleController;
