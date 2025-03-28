import { ValidationFailedError } from "../common/errors.js";
import { mySqlQuery } from "../common/utils.js";

class LectureAssignmentSACLQsService {
  getAllLectureAssignmentSACLQs = async (query) => {
    const {
      search,
      deleted, // Can be "all", "true", or "false"
      assignment_id,
      page = 1, // Default to page 1 if not provided
      size = 10, // Default to size 10 if not provided
      sort = "created_at", // Default sorting by created_at if not provided
    } = query;

    const offset = (page - 1) * size;

    let sqlQuery = `SELECT ??, ??, ??

            FROM ?? as ?? 
            WHERE 1=1`;

    const queryParams = [
      "saclq.self_assessment_checklist_id",
      "saclq.is_delete",
      "saclq.type",

      "self_assessment_checklist",
      "saclq",
    ];

    if (search) {
      sqlQuery += ` AND ?? LIKE ?`;
      queryParams.push("saclq.type", `%${search}%`);
    }

    if (assignment_id) {
      sqlQuery += ` AND ?? LIKE ?`;
      queryParams.push("saclq.assignment_id", assignment_id);
    }

    if (deleted != "all") {
      const deletedValue = deleted === "true" ? 1 : 0;
      sqlQuery += ` AND ?? = ?`;
      queryParams.push("saclq.is_delete", deletedValue);
    }

    const getCount = await mySqlQuery(sqlQuery, queryParams);

    sqlQuery += ` ORDER BY ?? LIMIT ? OFFSET ?`;
    queryParams.push(
      "saclq." + (assignment_id ? "order_id" : sort),
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

  createLectureAssignmentSACLQs = async (lectureAssignmentData) => {
    const checkIfLectureAssignmentExist = await mySqlQuery(
      "SELECT ?? FROM ?? where ?? = ?",
      [
        "assignment_id",
        "assignments",
        "assignment_id",
        lectureAssignmentData.assignment_id,
      ],
    );

    if (checkIfLectureAssignmentExist.length == 0) {
      throw new ValidationFailedError(`Lecture does not exists`);
    }

    const maxOrderId = await mySqlQuery(
      "select MAX(??) AS ?? from ?? where ?? = ?",
      [
        "order_id",
        "order_id",
        "self_assessment_checklist",
        "assignment_id",
        checkIfLectureAssignmentExist[0].assignment_id,
      ],
    );

    const newLectureAssignmentSACLQsData = {
      type: lectureAssignmentData.type,
      assignment_id: checkIfLectureAssignmentExist[0].assignment_id,

      is_delete: 0,
      order_id: maxOrderId[0].order_id + 1,

      created_at: new Date(),
      updated_at: new Date(),
    };

    await mySqlQuery("INSERT INTO ?? SET ?", [
      "self_assessment_checklist",
      newLectureAssignmentSACLQsData,
    ]);

    return newLectureAssignmentSACLQsData;
  };

  updateLectureAssignmentSACLQs = async (SACLQ_id, lectureAssignmentData) => {
    const updatedLectureAssignmentSACLQsData = {
      ...(lectureAssignmentData.type
        ? { type: lectureAssignmentData.type }
        : {}),
    };

    if (Object.keys(updatedLectureAssignmentSACLQsData).length > 0)
      updatedLectureAssignmentSACLQsData.updated_at = new Date();

    const data = await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
      "self_assessment_checklist",
      updatedLectureAssignmentSACLQsData,
      "self_assessment_checklist_id",
      SACLQ_id,
    ]);

    if (data.affectedRows > 0) return updatedLectureAssignmentSACLQsData;
    else return { msg: "No data to update" };
  };

  deleteLectureAssignmentSACLQs = async (SACLQ_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "self_assessment_checklist",
      "is_delete",
      1,
      "self_assessment_checklist_id",
      SACLQ_id,
    ]);
    if (data.affectedRows > 0)
      return "Lecture Assignment SACLQs deleted successfully";
    else return "Lecture Assignment not found";
  };

  restoreLectureAssignmentSACLQs = async (SACLQ_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "self_assessment_checklist",
      "is_delete",
      0,
      "self_assessment_checklist_id",
      SACLQ_id,
    ]);

    if (data.affectedRows > 0)
      return "Lecture Assignment SACLQs restored successfully";
    else return "Lecture Assignment not found";
  };

  swapLectureAssignmentSACLQs = async (
    self_assessment_checklist_id,
    action,
  ) => {
    const lectureAssignmentSACLQsToSwap = await mySqlQuery(
      `SELECT ??, ?? 
     FROM ?? 
     WHERE ?? ${
       action === "INCREMENT" ? ">=" : "<="
     } (SELECT ?? FROM ?? WHERE ?? = ?) 
     AND ?? = (SELECT ?? FROM ?? WHERE ?? = ?)
     ORDER BY ?? ${action === "INCREMENT" ? "ASC" : "DESC"} 
     LIMIT ?`,
      [
        "self_assessment_checklist_id",
        "order_id",
        "self_assessment_checklist",
        "order_id",
        "order_id",
        "self_assessment_checklist",
        "self_assessment_checklist_id",
        self_assessment_checklist_id,
        "assignment_id",
        "assignment_id",
        "self_assessment_checklist",
        "self_assessment_checklist_id",
        self_assessment_checklist_id,
        "order_id",
        2,
      ],
    );

    if (lectureAssignmentSACLQsToSwap.length < 2)
      throw new ValidationFailedError(
        "Single lecture assignment saclqs can not be swapped",
      );

    await mySqlQuery(`UPDATE ?? SET ?? = ? WHERE ?? =?`, [
      "self_assessment_checklist",
      "order_id",
      lectureAssignmentSACLQsToSwap[1].order_id,
      "self_assessment_checklist_id",
      lectureAssignmentSACLQsToSwap[0].self_assessment_checklist_id,
    ]);

    await mySqlQuery(`UPDATE ?? SET ?? = ? WHERE ?? =?`, [
      "self_assessment_checklist",
      "order_id",
      lectureAssignmentSACLQsToSwap[0].order_id,
      "self_assessment_checklist_id",
      lectureAssignmentSACLQsToSwap[1].self_assessment_checklist_id,
    ]);
    return "Lecture assignment saclqs swaped";
  };
}

export default LectureAssignmentSACLQsService;
