import { ValidationFailedError } from "../common/errors.js";
import { mySqlQuery } from "../common/utils.js";
import BaseService from "./base.service.js";

class LectureAssignmentService {
  getAllLectureAssignments = async (query) => {
    const {
      search,
      deleted, // Can be "all", "true", or "false"
      lecture_id,
      page = 1, // Default to page 1 if not provided
      size = 10, // Default to size 10 if not provided
      sort = "created_at", // Default sorting by created_at if not provided
    } = query;

    const offset = (page - 1) * size;

    let sqlQuery = `SELECT ??, ??, ??, ??, ??, ??,
            (SELECT COUNT(??) FROM ?? AS ?? WHERE ?? = ?? ) as ??

            FROM ?? as ?? 
            LEFT JOIN ?? as ?? ON ?? = ??
            WHERE 1=1`;

    const queryParams = [
      "a.assignment_id",
      "a.is_delete",
      "a.title",
      "a.objective",
      "a.video_link",
      "a.marks",

      "as.user_lecture_assignment_id",
      "user_lecture_assignments",
      "as",
      "as.lecture_assignment_id",
      "a.assignment_id",
      "submission_count",

      "assignments",
      "a",
      "lecture_assignments",
      "la",
      "a.assignment_id",
      "la.assignment_id",
    ];

    if (search) {
      sqlQuery += ` AND ?? LIKE ?`;
      queryParams.push("a.title", `%${search}%`);
    }

    if (lecture_id) {
      sqlQuery += ` AND ?? = ?`;
      queryParams.push("la.lecture_id", lecture_id);
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

  createLectureAssignment = async (lectureAssignmentData) => {
    const checkIfLectureExist = await mySqlQuery(
      "SELECT ?? FROM ?? where ?? = ?",
      [
        "lecture_id",
        "lectures",
        "lecture_id",
        lectureAssignmentData.lecture_id,
      ],
    );

    if (checkIfLectureExist.length == 0) {
      throw new ValidationFailedError(`Lecture does not exists`);
    }

    const newLectureAssignmentData = {
      title: lectureAssignmentData.title,
      objective: lectureAssignmentData.objective,
      video_link: lectureAssignmentData.video_link,
      marks: lectureAssignmentData.marks,

      is_delete: 0,

      created_at: new Date(),
      updated_at: new Date(),
    };

    const data = await mySqlQuery("INSERT INTO ?? SET ?", [
      "assignments",
      newLectureAssignmentData,
    ]);

    await mySqlQuery("INSERT INTO ?? SET ?", [
      "lecture_assignments",
      {
        lecture_id: checkIfLectureExist[0].lecture_id,
        assignment_id: data.insertId,
        is_delete: 0,

        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    return newLectureAssignmentData;
  };

  updateLectureAssignment = async (assignment_id, lectureAssignmentData) => {
    const updatedLectureAssignmentData = {
      ...(lectureAssignmentData.title
        ? { title: lectureAssignmentData.title }
        : {}),
      ...(lectureAssignmentData.objective
        ? { objective: lectureAssignmentData.objective }
        : {}),
      ...(lectureAssignmentData.video_link
        ? { video_link: lectureAssignmentData.video_link }
        : {}),
      ...(lectureAssignmentData.marks
        ? { marks: lectureAssignmentData.marks }
        : {}),
    };

    if (Object.keys(updatedLectureAssignmentData).length > 0)
      updatedLectureAssignmentData.updated_at = new Date();

    if (updatedLectureAssignmentData.video_link) {
      const assignment = await mySqlQuery("SELECT ?? FROM?? WHERE?? =?", [
        "video_link",
        "assignments",
        "assignment_id",
        assignment_id,
      ]);
      if (assignment[0].video_link != updatedLectureAssignmentData.video_link) {
        await BaseService.deleteObjectByUrl(assignment[0].video_link);
      }
    }

    const data = await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
      "assignments",
      updatedLectureAssignmentData,
      "assignment_id",
      assignment_id,
    ]);

    if (data.affectedRows > 0) return updatedLectureAssignmentData;
    else return { msg: "No data to update" };
  };

  deleteLectureAssignment = async (assignment_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "assignments",
      "is_delete",
      1,
      "assignment_id",
      assignment_id,
    ]);
    if (data.affectedRows > 0) return "Lecture Assignment deleted successfully";
    else return "Lecture Assignment not found";
  };

  restoreLectureAssignment = async (assignment_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "assignments",
      "is_delete",
      0,
      "assignment_id",
      assignment_id,
    ]);

    if (data.affectedRows > 0)
      return "Lecture Assignment restored successfully";
    else return "Lecture Assignment not found";
  };
}

export default LectureAssignmentService;
