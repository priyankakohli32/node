import AuthService from "../services/auth.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";
import EmailService from "../services/mail.service.js";
import { FRONTEND_WEB_URL } from "../common/constants.js";
import { emailTemplate } from "../common/emailTemplate.js";

class AuthController {
  _authService = new AuthService();

  login = async (req, res) => {
    try {
      const loginData = req.body;
      const result = await this._authService.login(loginData);
      return res.status(200).send(buildResponse(result, "Login successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  resetPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const result = await this._authService.resetPassword(email);
      await EmailService.sendEmail({
        to: email,
        subject: "RESET: you have requested to reset your password.",
        html: emailTemplate.resetPassword(result.resetToken),
      });
      delete result.resetToken;
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updatePassword = async (req, res) => {
    try {
      const { password } = req.body;
      const user_id = req.auth.id;
      const result = await this._authService.updatePassword(user_id, password);
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  logout = async (_req, res) => {
    try {
      res.clearCookie("jwtToken");
      return res
        .status(200)
        .send(buildResponse({ isLoggedIn: false }, "Logout successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  signup = async (req, res) => {
    try {
      const signUpData = req.body;

      const user = await this._authService.signup(signUpData);

      await EmailService.sendEmail({
        to: user.email,
        subject: "SIGNUP: you are requested to reset your password.",
        html: emailTemplate.signupEmail(user.resetToken),
      });
      delete user.resetToken;
      return res
        .status(200)
        .send(
          buildResponse(
            { user },
            ["Admin", "Mentor", "Student"][signUpData.role_id - 1] +
              " Created successfully",
          ),
        );
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default AuthController;
