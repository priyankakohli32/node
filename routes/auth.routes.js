import { Router } from "express";
import { bodySchemaValidator } from "../middlewares/schema.validator.js";
import AuthController from "../controllers/auth.controller.js";
import { LoginData, resetPasswordData, SignUpData, updatePasswordData } from "../schemas/auth.js";

const authRouter = Router({ mergeParams: true });

const authController = new AuthController();

authRouter.post(
  "/signup",
  bodySchemaValidator(SignUpData),
  authController.signup,
);

authRouter.post("/login", bodySchemaValidator(LoginData), authController.login);

authRouter.get("/logout", authController.logout);

authRouter.post(
  "/reset-password",
  bodySchemaValidator(resetPasswordData),
  authController.resetPassword,
);

authRouter.post(
  "/update-password",
  bodySchemaValidator(updatePasswordData),
  authController.updatePassword,
);

export default authRouter;
