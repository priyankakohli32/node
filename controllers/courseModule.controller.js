import CourseModuleService from "../services/courseModule.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class CourseModuleController {
  _courseModuleService = new CourseModuleService();

  getAllCourseModules = async (req, res) => {
    try {
      const queryData = req.query;
      const result = await this._courseModuleService.getAllCourseModules(
        queryData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "All courseModules data fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  getAllCourseModulesTitle = async (req, res) => {
    try {
      const course_id = req.params.course_id;
      const result = await this._courseModuleService.getAllCourseModulesTitle(
        course_id,
      );
      return res
        .status(200)
        .send(buildResponse(result, "CourseModules Title fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  createCourseModule = async (req, res) => {
    try {
      const courseModuleData = req.body;
      const result = await this._courseModuleService.createCourseModule(
        courseModuleData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "CourseModule created successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateCourseModule = async (req, res) => {
    try {
      const courseModuleData = req.body;
      const course_module_id = req.params.course_module_id;
      const result = await this._courseModuleService.updateCourseModule(
        course_module_id,
        courseModuleData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "CourseModule updated successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deleteCourseModule = async (req, res) => {
    try {
      const course_module_id = req.params.course_module_id;
      const result = await this._courseModuleService.deleteCourseModule(
        course_module_id,
      );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  restoreCourseModuleAccount = async (req, res) => {
    try {
      const course_module_id = req.params.course_module_id;
      const result = await this._courseModuleService.restoreCourseModuleAccount(
        course_module_id,
      );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  swapCourseModule = async (req, res) => {
    try {
      const { action } = req.body;
      const course_module_id = req.params.course_module_id;
      const result = await this._courseModuleService.swapCourseModule(
        course_module_id,
        action,
      );
      return res
        .status(200)
        .send(buildResponse(result, "Course Module swaped successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default CourseModuleController;
