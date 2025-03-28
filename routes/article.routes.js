import { Router } from "express";
import ArticleController from "../controllers/article.controller.js";
import {
  bodySchemaValidator,
  queryParamsValidator,
} from "../middlewares/schema.validator.js";
import {
  createArticleSchema,
  getAllArticlesQuerySchema,
  updateArticleSchema,
} from "../schemas/article.js";
import { check_permissions } from "../middlewares/check_role.middleware.js";

const articleRouter = Router({ mergeParams: true });

const articleController = new ArticleController();

articleRouter.get(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  queryParamsValidator(getAllArticlesQuerySchema),
  articleController.getAllArticles,
);

articleRouter.post(
  "/",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(createArticleSchema),
  articleController.createArticle,
);

articleRouter.patch(
  "/:article_id",
  check_permissions(["ADMIN", "MENTOR"]),
  bodySchemaValidator(updateArticleSchema),
  articleController.updateArticle,
);

articleRouter.delete(
  "/:article_id",
  check_permissions(["ADMIN"]),
  articleController.deleteArticle,
);

articleRouter.post(
  "/restore/:article_id",
  check_permissions(["ADMIN"]),
  articleController.restoreArticle,
);

export default articleRouter;
