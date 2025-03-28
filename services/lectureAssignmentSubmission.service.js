import { ValidationFailedError } from "../common/errors.js";
import { mySqlQuery } from "../common/utils.js";

class LectureAssignmentSubmissionService {
  getAllLectureAssignmentSubmission = async (query) => {
    const {
      deleted, // Can be "all", "true", or "false"
      assignment_id,
      page = 1, // Default to page 1 if not provided
      size = 10, // Default to size 10 if not provided
      sort = "created_at", // Default sorting by created_at if not provided
    } = query;

    const offset = (page - 1) * size;

    let sqlQuery = `SELECT ??, ??, ??, ??, ??, ??, ??, ??

            FROM ?? as ?? 
            LEFT JOIN ?? as ?? ON ?? = ??
            WHERE 1=1`;

    const queryParams = [
      "sub.user_lecture_assignment_id",
      "sub.upload_file_link",
      "sub.uploaded_file_name",
      "sub.uploaded_file_size",
      "sub.assignment_reply",
      "sub.is_complete",
      "sub.obtain_marks",
      "sub.is_delete",

      "user_lecture_assignments",
      "sub",
      
      "users",
      "u",
      "sub.user_id",
      "u.user_id",
    ];

    if (assignment_id) {
      sqlQuery += ` AND ?? LIKE ?`;
      queryParams.push("sub.lecture_assignment_id", assignment_id);
    }

    if (deleted != "all") {
      const deletedValue = deleted === "true" ? 1 : 0;
      sqlQuery += ` AND ?? = ?`;
      queryParams.push("sub.is_delete", deletedValue);
    }

    const getCount = await mySqlQuery(sqlQuery, queryParams);

    sqlQuery += ` ORDER BY ?? LIMIT ? OFFSET ?`;
    queryParams.push("sub." + sort, parseInt(size), offset);

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

  updateLectureAssignmentSubmission = async (
    submission_id,
    lectureAssignmentData,
  ) => {
    const updatedLectureAssignmentSubmissionData = {
      ...(lectureAssignmentData.assignment_reply
        ? { assignment_reply: lectureAssignmentData.assignment_reply }
        : {}),
      ...(lectureAssignmentData.obtain_marks
        ? { obtain_marks: lectureAssignmentData.obtain_marks }
        : {}),
    };

    if (Object.keys(updatedLectureAssignmentSubmissionData).length > 0)
      updatedLectureAssignmentSubmissionData.updated_at = new Date();

    const data = await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
      "user_lecture_assignments",
      updatedLectureAssignmentSubmissionData,
      "user_lecture_assignment_id",
      submission_id,
    ]);

    if (data.affectedRows > 0) return updatedLectureAssignmentSubmissionData;
    else return { msg: "No data to update" };
  };
}

export default LectureAssignmentSubmissionService;
