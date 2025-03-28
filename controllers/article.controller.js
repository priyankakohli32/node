import ArticleService from "../services/article.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class ArticleController {
  _articleService = new ArticleService();

  getAllArticles = async (req, res) => {
    try {
      const queryData = req.query;
      const result = await this._articleService.getAllArticles(queryData);
      return res
        .status(200)
        .send(buildResponse(result, "All articles data fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  createArticle = async (req, res) => {
    try {
      const articleData = req.body;
      const result = await this._articleService.createArticle(articleData);
      return res
        .status(200)
        .send(buildResponse(result, "Article created successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateArticle = async (req, res) => {
    try {
      const articleData = req.body;
      const article_id = req.params.article_id;
      const result = await this._articleService.updateArticle(
        article_id,
        articleData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "Article updated successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deleteArticle = async (req, res) => {
    try {
      const article_id = req.params.article_id;
      const result = await this._articleService.deleteArticle(article_id);
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  restoreArticle = async (req, res) => {
    try {
      const article_id = req.params.article_id;
      const result = await this._articleService.restoreArticle(article_id);
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default ArticleController;
