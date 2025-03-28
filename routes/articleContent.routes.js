import { Router } from "express";
import ArticleContentController from "../controllers/articleContent.controller.js";
import {
  bodySchemaValidator,
  queryParamsValidator,
} from "../middlewares/schema.validator.js";
import {
  createArticleContentSchema,
  getAllArticleContentsQuerySchema,
  swapArticleContentSchema,
  updateArticleContentSchema,
} from "../schemas/articleContent.js";
import { check_permissions } from "../middlewares/check_role.middleware.js";

const articleContentRouter = Router({ mergeParams: true });

const articleContentController = new ArticleContentController();

articleContentRouter.get(
  "/:article_id",
  check_permissions(["ADMIN", "MENTOR"]),
  queryParamsValidator(getAllArticleContentsQuerySchema),
  articleContentController.getAllArticleContents,
);

articleContentRouter.post(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(createArticleContentSchema),
  articleContentController.createArticleContent,
);

articleContentRouter.patch(
  "/:article_content_id",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(updateArticleContentSchema),
  articleContentController.updateArticleContent,
);

articleContentRouter.delete(
  "/:article_content_id",
  check_permissions(["ADMIN"]),
  articleContentController.deleteArticleContent,
);


articleContentRouter.patch(
  "/swap/:article_content_id",
  check_permissions(["ADMIN"]),
  bodySchemaValidator(swapArticleContentSchema),
  articleContentController.swapArticleContent,
);

export default articleContentRouter;
