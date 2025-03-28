import ArticleContentService from "../services/articleContent.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class ArticleContentController {
  _articleContentService = new ArticleContentService();

  getAllArticleContents = async (req, res) => {
    try {
      const queryData = req.query;
      const article_id = req.params.article_id;
      const result = await this._articleContentService.getAllArticleContents(
        article_id,
        queryData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "All article Contents data fetched"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  createArticleContent = async (req, res) => {
    try {
      const articleContentData = req.body;
      const result = await this._articleContentService.createArticleContent(
        articleContentData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "Article Content created successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  updateArticleContent = async (req, res) => {
    try {
      const articleContentData = req.body;
      const article_content_id = req.params.article_content_id;
      const result = await this._articleContentService.updateArticleContent(
        article_content_id,
        articleContentData,
      );
      return res
        .status(200)
        .send(buildResponse(result, "Article Content updated successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  deleteArticleContent = async (req, res) => {
    try {
      const article_content_id = req.params.article_content_id;
      const result = await this._articleContentService.deleteArticleContent(
        article_content_id,
      );
      return res.status(200).send(buildResponse(result, ""));
    } catch (error) {
      errorHandler(res, error);
    }
  };

  swapArticleContent = async (req, res) => {
    try {
      const { action } = req.body;
      const article_content_id = req.params.article_content_id;
      const result = await this._articleContentService.swapArticleContent(article_content_id, action);
      return res
        .status(200)
        .send(buildResponse(result, "Articel content swaped successfully"));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default ArticleContentController;
