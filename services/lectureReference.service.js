import { ValidationFailedError } from "../common/errors.js";
import { mySqlQuery } from "../common/utils.js";

class LectureReferenceService {
  getAllLectureReferences = async (query) => {
    const {
      search,
      lecture_id = 0,
      deleted, // Can be "all", "true", or "false"
      page = 1, // Default to page 1 if not provided
      size = 10, // Default to size 10 if not provided
      sort = "created_at", // Default sorting by created_at if not provided
    } = query;

    const offset = (page - 1) * size;

    let sqlQuery = `SELECT ?? AS ??, ??, ??, ??, ??, ??
            FROM ?? as ?? 
            LEFT JOIN ?? as ?? ON ?? = ?? 
            WHERE 1=1`;

    const queryParams = [
      "l.title",
      "lecture_title",
      "r.lecture_reference_id",
      "r.title",
      "r.reference",
      "r.reference_type",
      "r.is_delete",

      "lecture_reference",
      "r",

      "lectures",
      "l",
      "r.lecture_id",
      "l.lecture_id",
    ];

    if (search) {
      sqlQuery += ` AND ?? LIKE ?`;
      queryParams.push("r.title", `%${search}%`);
    }

    if (lecture_id) {
      sqlQuery += ` AND ?? = ? `;
      queryParams.push("r.lecture_id", lecture_id);
    }

    if (deleted != "all") {
      const deletedValue = deleted === "true" ? 1 : 0;
      sqlQuery += ` AND ?? = ?`;
      queryParams.push("r.is_delete", deletedValue);
    }

    sqlQuery += ` GROUP BY ?? `;
    queryParams.push("r.lecture_reference_id");

    const getCount = await mySqlQuery(sqlQuery, queryParams);

    sqlQuery += ` ORDER BY ?? LIMIT ? OFFSET ?`;
    queryParams.push("r." + sort, parseInt(size), offset);

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

  createLectureReference = async (lectureReferenceData) => {
    const checkIfCourseLectureExist = await mySqlQuery(
      "SELECT ?? FROM ?? where ?? = ?",
      ["lecture_id", "lectures", "lecture_id", lectureReferenceData.lecture_id],
    );

    if (checkIfCourseLectureExist.length == 0) {
      throw new ValidationFailedError(`Lecture does not exists`);
    }

    const newLectureReferenceData = {
      title: lectureReferenceData.title,
      reference: lectureReferenceData.reference,
      reference_type: lectureReferenceData.reference_type,

      lecture_id: checkIfCourseLectureExist[0].lecture_id,
      is_delete: 0,

      created_at: new Date(),
      updated_at: new Date(),
    };

    await mySqlQuery("INSERT INTO ?? SET ?", [
      "lecture_reference",
      newLectureReferenceData,
    ]);

    return newLectureReferenceData;
  };

  updateLectureReference = async (reference_id, lectureReferenceData) => {
    const updatedLectureReferenceData = {
      ...(lectureReferenceData.title
        ? { title: lectureReferenceData.title }
        : {}),
      ...(lectureReferenceData.reference
        ? { reference: lectureReferenceData.reference }
        : {}),
      ...(lectureReferenceData.reference_type
        ? { reference_type: lectureReferenceData.reference_type }
        : {}),
    };

    if (Object.keys(updatedLectureReferenceData).length > 0)
      updatedLectureReferenceData.updated_at = new Date();

    const data = await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
      "lecture_reference",
      updatedLectureReferenceData,
      "lecture_reference_id",
      reference_id,
    ]);

    if (data.affectedRows > 0) return updatedLectureReferenceData;
    else return { msg: "No data to update" };
  };

  deleteLectureReference = async (reference_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "lecture_reference",
      "is_delete",
      1,
      "lecture_reference_id",
      reference_id,
    ]);
    if (data.affectedRows > 0) return "LectureReference deleted successfully";
    else return "LectureReference not found";
  };

  restoreLectureReferenceAccount = async (reference_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "lecture_reference",
      "is_delete",
      0,
      "lecture_reference_id",
      reference_id,
    ]);

    if (data.affectedRows > 0) return "LectureReference restored successfully";
    else return "LectureReference not found";
  };
}

export default LectureReferenceService;
