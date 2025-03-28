import UserService from "../services/user.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class UserController {
  _userService = new UserService();

  getAllUsers = async (req, res) => {
    try {
      const queryData = req.query;
      const result = await this._userService.getAllUsers(queryData);
      return res.status(200).send(buildResponse(result, "All users fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  getUserShortDetail = async (req, res) => {
    try {
      const queryData = req.query;
      const result = await this._userService.getUserShortDetail(queryData);
      return res.status(200).send(buildResponse(result, "All users fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateUserData = async (req, res) => {
    try {
      const user_id = req.params.user_id;
      const userDetails = req.body;

      const result = await this._userService.updateUserData(
        user_id,
        userDetails,
      );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  changeUserFromStudentToMentor = async (req, res) => {
    try {
      const user_id = req.params.user_id;
      const result = await this._userService.changeUserFromStudentToMentor(
        user_id,
      );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deleteUser = async (req, res) => {
    try {
      const user_id = req.params.user_id;
      const result = await this._userService.deleteUser(user_id);
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  restoreUserAccount = async (req, res) => {
    try {
      const user_id = req.params.user_id;
      const result = await this._userService.restoreUserAccount(user_id);
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default UserController;
