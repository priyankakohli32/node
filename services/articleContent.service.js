import { ValidationFailedError } from "../common/errors.js";
import { mySqlQuery } from "../common/utils.js";
import BaseService from "./base.service.js";

class ArticleContentService {
  calculateReadingTime(text) {
    const wordsPerSecond = 4;
    const words = text.trim().split(/\s+/).length;
    const secondToRead = Math.ceil(words / wordsPerSecond);
    return secondToRead;
  }

  getAllArticleContents = async (article_id, query) => {
    const {
      search,
      page = 1, // Default to page 1 if not provided
      size = 10, // Default to size 10 if not provided
    } = query;

    const offset = (page - 1) * size;

    let getArticleSqlQuery = `SELECT ??, ??, ??, ??, ??, ??, ??, ??, ?? FROM ?? as ?? WHERE ?? = ?`;

    const getArticleQueryParams = [
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

      "a.article_id",
      article_id,
    ];

    let sqlQuery = `SELECT ??, ??, ??, ??, ??, ??, ??

            FROM ?? as ?? 
            WHERE ?? = ?`;

    const queryParams = [
      "ac.content_id",
      "ac.article_id",
      "ac.list_id",
      "ac.content_type",
      "ac.content_text",
      "ac.content_order",
      "ac.image_url",

      "article_content",
      "ac",
      "ac.article_id",
      article_id,
    ];

    if (search) {
      sqlQuery += ` AND ?? LIKE ?`;
      queryParams.push("ac.content_text", `%${search}%`);
    }

    const getArticleDetails = await mySqlQuery(
      getArticleSqlQuery,
      getArticleQueryParams,
    );

    const getCount = await mySqlQuery(sqlQuery, queryParams);

    sqlQuery += ` ORDER BY ?? LIMIT ? OFFSET ?`;
    queryParams.push("ac.content_order", parseInt(size), offset);

    const result = await mySqlQuery(sqlQuery, queryParams);
    return {
      article: getArticleDetails[0],
      result,
      pagination: {
        totalCount: getCount.length,
        currentPage: parseInt(page),
        currentSize: parseInt(size),
      },
    };
  };

  createArticleContent = async (articleContentData) => {
    const checkIfArticleExist = await mySqlQuery(
      "SELECT ?? FROM ?? where ?? = ?",
      ["article_id", "articles", "article_id", articleContentData.article_id],
    );

    if (checkIfArticleExist.length == 0) {
      throw new ValidationFailedError(`Article does not exists`);
    }

    const maxOrderId = await mySqlQuery(
      "select MAX(??) AS ?? from ?? where ?? = ?",
      [
        "content_order",
        "content_order",
        "article_content",
        "article_id",
        checkIfArticleExist[0].article_id,
      ],
    );

    const newArticleContentData = {
      article_id: checkIfArticleExist[0].article_id,
      list_id: articleContentData.list_id,
      content_type: articleContentData.content_type,
      content_text: articleContentData.content_text,
      image_url: articleContentData.image_url,
      content_order: maxOrderId[0].content_order + 1,
    };

    await mySqlQuery("INSERT INTO ?? SET ?", [
      "article_content",
      newArticleContentData,
    ]);

    this.updateArticleReadMinute(checkIfArticleExist[0].article_id);

    return newArticleContentData;
  };

  updateArticleContent = async (content_id, articleContentData) => {
    let article_id = 0;
    if (articleContentData.article_id) {
      const checkIfMentorExist = await mySqlQuery(
        "SELECT ?? FROM ?? where ?? = ?",
        ["article_id", "articles", "article_id", articleContentData.article_id],
      );

      if (checkIfMentorExist.length == 0) {
        throw new ValidationFailedError(`Article does not exists`);
      }
      article_id = checkIfMentorExist[0].article_id;
    }

    const updatedArticleContentData = {
      ...(article_id ? { article_id: article_id } : {}),
      ...(articleContentData.list_id
        ? { list_id: articleContentData.list_id }
        : {}),
      ...(articleContentData.content_type
        ? { content_type: articleContentData.content_type }
        : {}),
      ...(articleContentData.content_text
        ? { content_text: articleContentData.content_text }
        : {}),
      ...(articleContentData.image_url
        ? { image_url: articleContentData.image_url }
        : {}),
    };

    if (articleContentData.image_url) {
      const article_content = await mySqlQuery("SELECT ?? FROM?? WHERE?? =?", [
        "image_url",
        "article_content",
        "content_id",
        content_id,
      ]);
      if (article_content[0].image_url != articleContentData.image_url) {
        await BaseService.deleteObjectByUrl(article_content[0].image_url);
      }
    }

    const data = await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
      "article_content",
      updatedArticleContentData,
      "content_id",
      content_id,
    ]);

    if (data.affectedRows > 0) {
      if (article_id == 0) {
        const article = await mySqlQuery("SELECT ?? FROM ?? WHERE ?? = ?", [
          "article_id",
          "article_content",
          "content_id",
          content_id,
        ]);

        article_id = article[0].article_id;
      }
      this.updateArticleReadMinute(article_id);
      return updatedArticleContentData;
    } else return { msg: "No data to update" };
  };

  deleteArticleContent = async (content_id) => {
    const sqlQuery = `DELETE FROM ?? WHERE ?? = ?`;
    const data = await mySqlQuery(sqlQuery, [
      "article_content",
      "content_id",
      content_id,
    ]);
    if (data.affectedRows > 0) return "ArticleContent deleted successfully";
    else return "ArticleContent not found";
  };

  updateArticleReadMinute = async (article_id) => {
    const contents = await mySqlQuery("SELECT ?? FROM ?? WHERE ?? = ?", [
      "content_text",
      "article_content",
      "article_id",
      article_id,
    ]);

    const textToRead = contents.reduce((normalText, content) => {
      return normalText + " " + content.content_text;
    }, "");

    const timeToRead = this.calculateReadingTime(textToRead);

    await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
      "articles",
      {
        minutes_to_read: timeToRead,
      },
      "article_id",
      article_id,
    ]);
  };

  swapArticleContent = async (content_id, action) => {
    const articleContentsToSwap = await mySqlQuery(
      `SELECT ??, ?? 
     FROM ?? 
     WHERE ?? ${
       action === "INCREMENT" ? ">=" : "<="
     } (SELECT ?? FROM ?? WHERE ?? = ?) 
     AND ?? = (SELECT ?? FROM ?? WHERE ?? = ?)
     ORDER BY ?? ${action === "INCREMENT" ? "ASC" : "DESC"} 
     LIMIT ?`,
      [
        "content_id",
        "content_order",
        "article_content",
        "content_order",
        "content_order",
        "article_content",
        "content_id",
        content_id,
        "article_id",
        "article_id",
        "article_content",
        "content_id",
        content_id,
        "content_order",
        2,
      ],
    );

    if (articleContentsToSwap.length < 2)
      throw new ValidationFailedError(
        "Single article content can not be swapped",
      );

    await mySqlQuery(`UPDATE ?? SET ?? = ? WHERE ?? =?`, [
      "article_content",
      "content_order",
      articleContentsToSwap[1].content_order,
      "content_id",
      articleContentsToSwap[0].content_id,
    ]);

    await mySqlQuery(`UPDATE ?? SET ?? = ? WHERE ?? =?`, [
      "article_content",
      "content_order",
      articleContentsToSwap[0].content_order,
      "content_id",
      articleContentsToSwap[1].content_id,
    ]);
    return "Article Content swaped";
  };
}

export default ArticleContentService;
