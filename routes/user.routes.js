import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import { getAllUsersQuerySchema, getUserShortDetails, updateUserSchema } from "../schemas/user.js";
import {
  bodySchemaValidator,
  queryParamsValidator,
} from "../middlewares/schema.validator.js";
import { check_permissions } from "../middlewares/check_role.middleware.js";

const userRouter = Router({ mergeParams: true });

const userController = new UserController();

userRouter.get(
  "/",
  check_permissions(["ADMIN"]),
  queryParamsValidator(getAllUsersQuerySchema),
  userController.getAllUsers,
);

userRouter.get(
  "/name",
  check_permissions(["ADMIN"]),
  queryParamsValidator(getUserShortDetails),
  userController.getUserShortDetail,
);

userRouter.patch(
  "/:user_id",
  check_permissions(["ADMIN"]),
  queryParamsValidator(updateUserSchema),
  userController.updateUserData,
);

userRouter.post(
  "/:user_id",
  check_permissions(["ADMIN"]),
  userController.changeUserFromStudentToMentor,
);

userRouter.post(
  "/restore/:user_id",
  check_permissions(["ADMIN"]),
  userController.restoreUserAccount,
);

userRouter.delete(
  "/:user_id",
  check_permissions(["ADMIN"]),
  userController.deleteUser,
);

export default userRouter;
