import { ValidationFailedError } from "../common/errors.js";
import { mySqlQuery } from "../common/utils.js";

class LectureAssignmentInstructionService {
  getAllLectureAssignmentInstructions = async (query) => {
    const {
      search,
      deleted, // Can be "all", "true", or "false"
      assignment_id,
      page = 1, // Default to page 1 if not provided
      size = 10, // Default to size 10 if not provided
      sort = "created_at", // Default sorting by created_at if not provided
    } = query;

    const offset = (page - 1) * size;

    let sqlQuery = `SELECT ??, ??, ??, ??

            FROM ?? as ?? 
            WHERE 1=1`;

    const queryParams = [
      "ai.assignmet_instruction_id",
      "ai.is_delete",
      "ai.title",
      "ai.description",

      "assignment_instruction",
      "ai",
    ];

    if (search) {
      sqlQuery += ` AND ?? LIKE ?`;
      queryParams.push("ai.title", `%${search}%`);
    }

    if (assignment_id) {
      sqlQuery += ` AND ?? LIKE ?`;
      queryParams.push("ai.assignment_id", assignment_id);
    }

    if (deleted != "all") {
      const deletedValue = deleted === "true" ? 1 : 0;
      sqlQuery += ` AND ?? = ?`;
      queryParams.push("ai.is_delete", deletedValue);
    }

    const getCount = await mySqlQuery(sqlQuery, queryParams);

    sqlQuery += ` ORDER BY ?? LIMIT ? OFFSET ?`;
    queryParams.push(
      "ai." + (assignment_id ? "order_id" : sort),
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

  createLectureAssignmentInstruction = async (lectureAssignmentData) => {
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
        "assignment_instruction",
        "assignment_id",
        checkIfLectureAssignmentExist[0].assignment_id,
      ],
    );

    const newLectureAssignmentInstructionData = {
      title: lectureAssignmentData.title,
      description: lectureAssignmentData.description,
      assignment_id: checkIfLectureAssignmentExist[0].assignment_id,

      is_delete: 0,
      order_id: maxOrderId[0].order_id + 1,

      created_at: new Date(),
      updated_at: new Date(),
    };

    await mySqlQuery("INSERT INTO ?? SET ?", [
      "assignment_instruction",
      newLectureAssignmentInstructionData,
    ]);

    return newLectureAssignmentInstructionData;
  };

  updateLectureAssignmentInstruction = async (
    assignmet_instruction_id,
    lectureAssignmentData,
  ) => {
    const updatedLectureAssignmentInstructionData = {
      ...(lectureAssignmentData.title
        ? { title: lectureAssignmentData.title }
        : {}),
      ...(lectureAssignmentData.description
        ? { description: lectureAssignmentData.description }
        : {}),
    };

    if (Object.keys(updatedLectureAssignmentInstructionData).length > 0)
      updatedLectureAssignmentInstructionData.updated_at = new Date();

    const data = await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
      "assignment_instruction",
      updatedLectureAssignmentInstructionData,
      "assignmet_instruction_id",
      assignmet_instruction_id,
    ]);

    if (data.affectedRows > 0) return updatedLectureAssignmentInstructionData;
    else return { msg: "No data to update" };
  };

  deleteLectureAssignmentInstruction = async (assignmet_instruction_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "assignment_instruction",
      "is_delete",
      1,
      "assignmet_instruction_id",
      assignmet_instruction_id,
    ]);
    if (data.affectedRows > 0)
      return "Lecture Assignment instruction deleted successfully";
    else return "Lecture Assignment not found";
  };

  restoreLectureAssignmentInstruction = async (assignmet_instruction_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "assignment_instruction",
      "is_delete",
      0,
      "assignmet_instruction_id",
      assignmet_instruction_id,
    ]);

    if (data.affectedRows > 0)
      return "Lecture Assignment instruction restored successfully";
    else return "Lecture Assignment not found";
  };

  swapLectureAssignmentInstruction = async (
    assignmet_instruction_id,
    action,
  ) => {
    const lectureAssignmentInstructionsToSwap = await mySqlQuery(
      `SELECT ??, ?? 
     FROM ?? 
     WHERE ?? ${
       action === "INCREMENT" ? ">=" : "<="
     } (SELECT ?? FROM ?? WHERE ?? = ?) 
     AND ?? = (SELECT ?? FROM ?? WHERE ?? = ?)
     ORDER BY ?? ${action === "INCREMENT" ? "ASC" : "DESC"} 
     LIMIT ?`,
      [
        "assignmet_instruction_id",
        "order_id",
        "assignment_instruction",
        "order_id",
        "order_id",
        "assignment_instruction",
        "assignmet_instruction_id",
        assignmet_instruction_id,
        "assignment_id",
        "assignment_id",
        "assignment_instruction",
        "assignmet_instruction_id",
        assignmet_instruction_id,
        "order_id",
        2,
      ],
    );

    if (lectureAssignmentInstructionsToSwap.length < 2)
      throw new ValidationFailedError(
        "Single lecture assignment instruction can not be swapped",
      );

    await mySqlQuery(`UPDATE ?? SET ?? = ? WHERE ?? =?`, [
      "assignment_instruction",
      "order_id",
      lectureAssignmentInstructionsToSwap[1].order_id,
      "assignmet_instruction_id",
      lectureAssignmentInstructionsToSwap[0].assignmet_instruction_id,
    ]);

    await mySqlQuery(`UPDATE ?? SET ?? = ? WHERE ?? =?`, [
      "assignment_instruction",
      "order_id",
      lectureAssignmentInstructionsToSwap[0].order_id,
      "assignmet_instruction_id",
      lectureAssignmentInstructionsToSwap[1].assignmet_instruction_id,
    ]);
    return "Lecture assignment instruction swaped";
  };
}

export default LectureAssignmentInstructionService;
