import { ValidationFailedError } from "../common/errors.js";
import { mySqlQuery } from "../common/utils.js";
import BaseService from "./base.service.js";
import NotificationService from "./notification.service.js";

class InterviewService {
  getAllInterviews = async (query) => {
    const {
      search,
      deleted, // Can be "all", "true", or "false"
      page = 1, // Default to page 1 if not provided
      size = 10, // Default to size 10 if not provided
      sort = "created_at", // Default sorting by created_at if not provided
    } = query;

    const offset = (page - 1) * size;

    let sqlQuery = `SELECT ??, ??, ??, ??, ??, ??

            FROM ?? as ?? 
            WHERE 1=1`;

    const queryParams = [
      "i.interview_id",
      "i.title",
      "i.preview_image",
      "i.time",
      "i.link",
      "i.is_delete",

      "interviews",
      "i",
    ];

    if (search) {
      sqlQuery += ` AND ?? LIKE ?`;
      queryParams.push("i.title", `%${search}%`);
    }

    if (deleted != "all") {
      const deletedValue = deleted === "true" ? 1 : 0;
      sqlQuery += ` AND ?? = ?`;
      queryParams.push("i.is_delete", deletedValue);
    }

    const getCount = await mySqlQuery(sqlQuery, queryParams);

    sqlQuery += ` ORDER BY ?? LIMIT ? OFFSET ?`;
    queryParams.push("i." + sort, parseInt(size), offset);

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

  createInterview = async (interviewData) => {
    const newInterviewData = {
      title: interviewData.title,
      preview_image: interviewData.preview_image,
      time: interviewData.time,
      link: interviewData.link,

      is_delete: 0,

      created_at: new Date(),
      updated_at: new Date(),
    };

    await mySqlQuery("INSERT INTO ?? SET ?", ["interviews", newInterviewData]);
    await NotificationService.notifyResourceCreationToAllUsers();

    return newInterviewData;
  };

  updateInterview = async (interview_id, interviewData) => {
    const updatedInterviewData = {
      ...(interviewData.title ? { title: interviewData.title } : {}),
      ...(interviewData.preview_image
        ? { preview_image: interviewData.preview_image }
        : {}),
      ...(interviewData.time ? { time: interviewData.time } : {}),
      ...(interviewData.link ? { link: interviewData.link } : {}),
    };

    if (Object.keys(updatedInterviewData).length > 0)
      updatedInterviewData.updated_at = new Date();

    if (interviewData.preview_image) {
      const interview = await mySqlQuery("SELECT ?? FROM?? WHERE?? =?", [
        "preview_image",
        "interviews",
        "interview_id",
        interview_id,
      ]);
      if (interview[0].preview_image != interviewData.preview_image) {
        await BaseService.deleteObjectByUrl(interview[0].preview_image);
      }
    }

    const data = await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
      "interviews",
      updatedInterviewData,
      "interview_id",
      interview_id,
    ]);

    if (data.affectedRows > 0) return updatedInterviewData;
    else return { msg: "No data to update" };
  };

  deleteInterview = async (interview_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "interviews",
      "is_delete",
      1,
      "interview_id",
      interview_id,
    ]);
    if (data.affectedRows > 0) return "Interview deleted successfully";
    else return "Interview not found";
  };

  restoreInterview = async (interview_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "interviews",
      "is_delete",
      0,
      "interview_id",
      interview_id,
    ]);

    if (data.affectedRows > 0) return "Interview restored successfully";
    else return "Interview not found";
  };
}

export default InterviewService;
