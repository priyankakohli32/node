import { ValidationFailedError } from "../common/errors.js";
import { mySqlQuery } from "../common/utils.js";
import BaseService from "./base.service.js";

class LectureContentService {
  getAllLectureContents = async (query) => {
    const {
      search,
      lecture_id = 0,
      deleted, // Can be "all", "true", or "false"
      page = 1, // Default to page 1 if not provided
      size = 10, // Default to size 10 if not provided
      sort = "created_at", // Default sorting by created_at if not provided
    } = query;

    const offset = (page - 1) * size;

    let sqlQuery = `SELECT ?? AS ??, ??, ??, ??, ??, ??, ??, ??, ??
            FROM ?? as ?? 
            LEFT JOIN ?? as ?? ON ?? = ?? 
            WHERE 1=1`;

    const queryParams = [
      "l.title",
      "lecture_title",
      "c.content_id",
      "c.title",
      "c.preview_image",
      "c.content_link",
      "c.content_type",
      "c.content_size",
      "c.duration",
      "c.is_delete",

      "contents",
      "c",

      "lectures",
      "l",
      "c.lecture_id",
      "l.lecture_id",
    ];

    if (search) {
      sqlQuery += ` AND ?? LIKE ?`;
      queryParams.push("c.title", `%${search}%`);
    }

    if (lecture_id) {
      sqlQuery += ` AND ?? = ? `;
      queryParams.push("c.lecture_id", lecture_id);
    }

    if (deleted != "all") {
      const deletedValue = deleted === "true" ? 1 : 0;
      sqlQuery += ` AND ?? = ?`;
      queryParams.push("c.is_delete", deletedValue);
    }

    sqlQuery += ` GROUP BY ?? `;
    queryParams.push("c.content_id");

    const getCount = await mySqlQuery(sqlQuery, queryParams);

    sqlQuery += ` ORDER BY ?? LIMIT ? OFFSET ?`;
    queryParams.push(
      "c." + (lecture_id ? "order_id" : sort),
      parseInt(size),
      offset,
    );

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

  createLectureContent = async (lectureContentData) => {
    const checkIfCourseLectureExist = await mySqlQuery(
      "SELECT ?? FROM ?? where ?? = ?",
      ["lecture_id", "lectures", "lecture_id", lectureContentData.lecture_id],
    );

    if (checkIfCourseLectureExist.length == 0) {
      throw new ValidationFailedError(`Lecture does not exists`);
    }

    const maxOrderId = await mySqlQuery(
      "select MAX(??) AS ?? from ?? where ?? = ?",
      [
        "order_id",
        "order_id",
        "contents",
        "lecture_id",
        checkIfCourseLectureExist[0].lecture_id,
      ],
    );

    const newLectureContentData = {
      title: lectureContentData.title,
      preview_image: lectureContentData.preview_image,
      content_link: lectureContentData.content_link,
      content_type: lectureContentData.content_type,
      content_size: lectureContentData.content_size,
      duration: lectureContentData.duration,

      lecture_id: checkIfCourseLectureExist[0].lecture_id,
      is_delete: 0,
      order_id: maxOrderId[0].order_id + 1,

      created_at: new Date(),
      updated_at: new Date(),
    };

    await mySqlQuery("INSERT INTO ?? SET ?", [
      "contents",
      newLectureContentData,
    ]);

    return newLectureContentData;
  };

  updateLectureContent = async (content_id, lectureContentData) => {
    const updatedLectureContentData = {
      ...(lectureContentData.title ? { title: lectureContentData.title } : {}),
      ...(lectureContentData.preview_image
        ? { preview_image: lectureContentData.preview_image }
        : {}),
      ...(lectureContentData.content_link
        ? { content_link: lectureContentData.content_link }
        : {}),
      ...(lectureContentData.content_type
        ? { content_type: lectureContentData.content_type }
        : {}),
      ...(lectureContentData.content_size
        ? { content_size: lectureContentData.content_size }
        : {}),
      ...(lectureContentData.duration
        ? { duration: lectureContentData.duration }
        : {}),
    };

    if (Object.keys(updatedLectureContentData).length > 0)
      updatedLectureContentData.updated_at = new Date();

    if (lectureContentData.preview_image) {
      const content = await mySqlQuery("SELECT ?? FROM?? WHERE?? =?", [
        "preview_image",
        "contents",
        "content_id",
        content_id,
      ]);
      if (content[0].preview_image != lectureContentData.preview_image) {
        await BaseService.deleteObjectByUrl(content[0].preview_image);
      }
    }

    if (lectureContentData.content_link) {
      const content = await mySqlQuery("SELECT ?? FROM?? WHERE?? =?", [
        "content_link",
        "contents",
        "content_id",
        content_id,
      ]);
      if (content[0].content_link != lectureContentData.content_link) {
        await BaseService.deleteObjectByUrl(content[0].content_link);
      }
    }

    const data = await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
      "contents",
      updatedLectureContentData,
      "content_id",
      content_id,
    ]);

    if (data.affectedRows > 0) return updatedLectureContentData;
    else return { msg: "No data to update" };
  };

  deleteLectureContent = async (content_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "contents",
      "is_delete",
      1,
      "content_id",
      content_id,
    ]);
    if (data.affectedRows > 0) return "LectureContent deleted successfully";
    else return "LectureContent not found";
  };

  restoreLectureContentAccount = async (content_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "contents",
      "is_delete",
      0,
      "content_id",
      content_id,
    ]);

    if (data.affectedRows > 0) return "LectureContent restored successfully";
    else return "LectureContent not found";
  };

  swapLectureContent = async (content_id, action) => {
    const lectureContentsToSwap = await mySqlQuery(
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
        "order_id",
        "contents",
        "order_id",
        "order_id",
        "contents",
        "content_id",
        content_id,
        "lecture_id",
        "lecture_id",
        "contents",
        "content_id",
        content_id,
        "order_id",
        2,
      ],
    );

    if (lectureContentsToSwap.length < 2)
      throw new ValidationFailedError(
        "Single lecture content can not be swapped",
      );

    await mySqlQuery(`UPDATE ?? SET ?? = ? WHERE ?? =?`, [
      "contents",
      "order_id",
      lectureContentsToSwap[1].order_id,
      "content_id",
      lectureContentsToSwap[0].content_id,
    ]);

    await mySqlQuery(`UPDATE ?? SET ?? = ? WHERE ?? =?`, [
      "contents",
      "order_id",
      lectureContentsToSwap[0].order_id,
      "content_id",
      lectureContentsToSwap[1].content_id,
    ]);
    return "Lecture content swaped";
  };
}

export default LectureContentService;
