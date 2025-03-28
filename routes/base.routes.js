import { Router } from "express";
import BaseController from "../controllers/base.controller.js";
import { PreSignedUrlData } from "../schemas/base.js";
import { bodySchemaValidator } from "../middlewares/schema.validator.js";

const baseRouter = Router({ mergeParams: true });

const baseController = new BaseController();

baseRouter.post(
  "/get-presigned-url",
  bodySchemaValidator(PreSignedUrlData),
  baseController.getPreSignedUrl,
);

export default baseRouter;
