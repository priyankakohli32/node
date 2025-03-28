import { ValidationFailedError } from "../common/errors.js";
import { mySqlQuery } from "../common/utils.js";

class CourseReferenceService {
  getAllCourseReferences = async (query) => {
    const {
      search,
      course_id = 0,
      deleted, // Can be "all", "true", or "false"
      page = 1, // Default to page 1 if not provided
      size = 10, // Default to size 10 if not provided
      sort = "created_at", // Default sorting by created_at if not provided
    } = query;

    const offset = (page - 1) * size;

    let sqlQuery = `SELECT ??, ??, ??, ??, ?? AS ??
            FROM ?? as ?? 
            LEFT JOIN ?? as ?? ON ?? = ?? 
            WHERE 1=1`;
    const queryParams = [
      "cr.course_reference_id",
      "cr.reference",
      "cr.is_delete",
      "cr.reference_type",
      "c.name",
      "course_name",

      "course_reference",
      "cr",

      "courses",
      "c",
      "cr.course_id",
      "c.course_id",
    ];

    if (search) {
      sqlQuery += ` AND ?? LIKE ?`;
      queryParams.push("reference", `%${search}%`);
    }

    if (course_id) {
      sqlQuery += ` AND ?? = ? `;
      queryParams.push("cr.course_id", course_id);
    }

    if (deleted != "all") {
      const deletedValue = deleted === "true" ? 1 : 0;
      sqlQuery += ` AND ?? = ?`;
      queryParams.push("cr.is_delete", deletedValue);
    }

    const getCount = await mySqlQuery(sqlQuery, queryParams);

    sqlQuery += ` ORDER BY ?? LIMIT ? OFFSET ?`;
    queryParams.push("cr." + sort, parseInt(size), offset);

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

  createCourseReference = async (courseReferenceData) => {
    const checkIfCourseExist = await mySqlQuery(
      "SELECT ?? FROM ?? where ?? = ?",
      ["course_id", "courses", "course_id", courseReferenceData.course_id],
    );

    if (checkIfCourseExist.length == 0) {
      throw new ValidationFailedError(`Course does not exists`);
    }

    const newCourseReferenceData = {
      reference: courseReferenceData.reference,
      reference_type: courseReferenceData.reference_type,

      course_id: checkIfCourseExist[0].course_id,
      is_delete: 0,

      created_at: new Date(),
      updated_at: new Date(),
    };

    await mySqlQuery("INSERT INTO ?? SET ?", [
      "course_reference",
      newCourseReferenceData,
    ]);

    return newCourseReferenceData;
  };

  updateCourseReference = async (course_reference_id, courseReferenceData) => {
    let course_id = 0;
    if (courseReferenceData.course_id) {
      const checkIfCourseExist = await mySqlQuery(
        "SELECT ?? FROM ?? where ?? = ?",
        ["course_id", "courses", "course_id", courseReferenceData.course_id],
      );

      if (checkIfCourseExist.length == 0) {
        throw new ValidationFailedError(`Course does not exists`);
      }
      course_id = checkIfCourseExist[0].course_id;
    }

    const updatedCourseReferenceData = {
      ...(courseReferenceData.reference
        ? { reference: courseReferenceData.reference }
        : {}),

      ...(courseReferenceData.reference_type
        ? { reference_type: courseReferenceData.reference_type }
        : {}),

      ...(course_id ? { course_id: course_id } : {}),
    };

    if (Object.keys(updatedCourseReferenceData).length > 0)
      updatedCourseReferenceData.updated_at = new Date();

    const data = await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
      "course_reference",
      updatedCourseReferenceData,
      "course_reference_id",
      course_reference_id,
    ]);

    if (data.affectedRows > 0) return updatedCourseReferenceData;
    else return { msg: "No data to update" };
  };

  deleteCourseReference = async (course_reference_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "course_reference",
      "is_delete",
      1,
      "course_reference_id",
      course_reference_id,
    ]);
    if (data.affectedRows > 0) return "CourseReference deleted successfully";
    else return "CourseReference not exist";
  };

  restoreCourseReferenceAccount = async (course_reference_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "course_reference",
      "is_delete",
      0,
      "course_reference_id",
      course_reference_id,
    ]);
    if (data.affectedRows > 0) return "CourseReference restored successfully";
    else return "CourseReference not found";
  };
}

export default CourseReferenceService;
