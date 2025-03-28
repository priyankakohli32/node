import CourseService from "../services/course.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class CourseController {
  _courseService = new CourseService();

  getAllCourses = async (req, res) => {
    try {
      const queryData = req.query;
      const result = await this._courseService.getAllCourses(queryData);
      return res
        .status(200)
        .send(buildResponse(result, "All courses data fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  getAllCoursesTitle = async (req, res) => {
    try {
      const result = await this._courseService.getAllCoursesTitle();
      return res
        .status(200)
        .send(buildResponse(result, "Courses Title fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  createCourse = async (req, res) => {
    try {
      const courseData = req.body;
      const result = await this._courseService.createCourse(courseData);
      return res
        .status(200)
        .send(buildResponse(result, "Course created successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateCourse = async (req, res) => {
    try {
      const courseData = req.body;
      const course_id = req.params.course_id;
      const result = await this._courseService.updateCourse(
        course_id,
        courseData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "Course updated successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  swapCourse = async (req, res) => {
    try {
      const { action } = req.body;
      const course_id = req.params.course_id;
      const result = await this._courseService.swapCourse(course_id, action);
      return res
        .status(200)
        .send(buildResponse(result, "Course swaped successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deleteCourse = async (req, res) => {
    try {
      const course_id = req.params.course_id;
      const result = await this._courseService.deleteCourse(course_id);
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  restoreCourseAccount = async (req, res) => {
    try {
      const course_id = req.params.course_id;
      const result = await this._courseService.restoreCourseAccount(course_id);
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default CourseController;
