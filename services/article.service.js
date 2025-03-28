import { ValidationFailedError } from "../common/errors.js";
import { mySqlQuery } from "../common/utils.js";
import BaseService from "./base.service.js";
import NotificationService from "./notification.service.js";

class ArticleService {
  getAllArticles = async (query) => {
    const {
      search,
      deleted, // Can be "all", "true", or "false"
      page = 1, // Default to page 1 if not provided
      size = 10, // Default to size 10 if not provided
      sort = "created_at", // Default sorting by created_at if not provided
    } = query;

    const offset = (page - 1) * size;

    let sqlQuery = `SELECT ??, ??, ??, ??, ??, ??, ??, ??, ??

            FROM ?? as ?? 
            WHERE 1=1`;

    const queryParams = [
      "a.article_id",
      "a.title",
      "a.preview_image",
      "a.subtitle",
      "a.writer_name",
      "a.articleLink",
      "a.minutes_to_read",
      "a.uploaded_date",
      "a.is_delete",

      "articles",
      "a",
    ];

    if (search) {
      sqlQuery += ` AND ?? LIKE ?`;
      queryParams.push("a.title", `%${search}%`);
    }

    if (deleted != "all") {
      const deletedValue = deleted === "true" ? 1 : 0;
      sqlQuery += ` AND ?? = ?`;
      queryParams.push("a.is_delete", deletedValue);
    }

    const getCount = await mySqlQuery(sqlQuery, queryParams);

    sqlQuery += ` ORDER BY ?? LIMIT ? OFFSET ?`;
    queryParams.push("a." + sort, parseInt(size), offset);

    const result = await mySqlQuery(sqlQuery, queryParams);
    return {
      result,
      pagination: {
        totalCount: getCount.length,
        currentPage: parseInt(page),
        currentSize: parseInt(size),
      },
    };
  };

  createArticle = async (articleData) => {
    const newArticleData = {
      title: articleData.title,
      preview_image: articleData.preview_image,
      subtitle: articleData.subtitle,
      writer_name: articleData.writer_name,
      articleLink: articleData.articleLink,
      minutes_to_read: 0,
      is_delete: 0,

      uploaded_date: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    await mySqlQuery("INSERT INTO ?? SET ?", ["articles", newArticleData]);
    await NotificationService.notifyResourceCreationToAllUsers();

    return newArticleData;
  };

  updateArticle = async (article_id, articleData) => {
    const updatedArticleData = {
      ...(articleData.title ? { title: articleData.title } : {}),
      ...(articleData.preview_image
        ? { preview_image: articleData.preview_image }
        : {}),
      ...(articleData.subtitle ? { subtitle: articleData.subtitle } : {}),
      ...(articleData.writer_name
        ? { writer_name: articleData.writer_name }
        : {}),
      ...(articleData.articleLink
        ? { articleLink: articleData.articleLink }
        : {}),
    };

    if (Object.keys(updatedArticleData).length > 0)
      updatedArticleData.updated_at = new Date();

    if (updatedArticleData.preview_image) {
      const article = await mySqlQuery("SELECT ?? FROM?? WHERE?? =?", [
        "preview_image",
        "articles",
        "article_id",
        article_id,
      ]);
      if (article[0].preview_image != articleData.preview_image) {
        await BaseService.deleteObjectByUrl(article[0].preview_image);
      }
    }

    const data = await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
      "articles",
      updatedArticleData,
      "article_id",
      article_id,
    ]);

    if (data.affectedRows > 0) return updatedArticleData;
    else return { msg: "No data to update" };
  };

  deleteArticle = async (article_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "articles",
      "is_delete",
      1,
      "article_id",
      article_id,
    ]);
    if (data.affectedRows > 0) return "Article deleted successfully";
    else return "Article not found";
  };

  restoreArticle = async (article_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "articles",
      "is_delete",
      0,
      "article_id",
      article_id,
    ]);

    if (data.affectedRows > 0) return "Article restored successfully";
    else return "Article not found";
  };
}

export default ArticleService;
