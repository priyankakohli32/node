import { ValidationFailedError } from "../common/errors.js";
import { mySqlQuery } from "../common/utils.js";

class LectureMCQsService {
  getAllLectureMCQs = async (query) => {
    const {
      search,
      lecture_id = 0,
      deleted, // Can be "all", "true", or "false"
      page = 1, // Default to page 1 if not provided
      size = 10, // Default to size 10 if not provided
      sort = "created_at", // Default sorting by created_at if not provided
    } = query;

    const offset = (page - 1) * size;

    let sqlQuery = `SELECT ??, ??, ??, ??, ??, ??, ??, ??,
            IF(COUNT(??), JSON_ARRAYAGG(JSON_OBJECT(
              ?, ??,
              ?, ??,
              ?, ??,
              ?, ??
            )), NULL) as ??
            FROM ?? as ?? 
            LEFT JOIN ?? as ?? ON ?? = ?? 
            LEFT JOIN ?? as ?? ON ?? = ?? 
            LEFT JOIN ?? as ?? ON ?? = ?? 
            WHERE 1=1`;

    const queryParams = [
      "mcq.mcq_id",
      "mcq.title",
      "mcq.description",
      "mcq.is_delete",
      "mcq.marks",
      "mcq.mcq_type",

      "exp.correct_explanation",
      "exp.wrong_explanation",

      "op.option_id",
      "option_id",
      "op.option_id",
      "option",
      "op.option",
      "reason",
      "op.reason",
      "is_correct",
      "op.is_correct",

      "options",

      "mcq",
      "mcq",

      "mcq_explanation",
      "exp",
      "mcq.mcq_id",
      "exp.mcq_id",

      "lecture_mcqs",
      "lmcq",
      "mcq.mcq_id",
      "lmcq.mcq_id",

      "options",
      "op",
      "mcq.mcq_id",
      "op.mcq_id",
    ];

    if (search) {
      sqlQuery += ` AND ?? LIKE ?`;
      queryParams.push("title", `%${search}%`);
    }

    if (lecture_id) {
      sqlQuery += ` AND ?? = ? `;
      queryParams.push("lmcq.lecture_id", lecture_id);
    }

    if (deleted != "all") {
      const deletedValue = deleted === "true" ? 1 : 0;
      sqlQuery += ` AND ?? = ?`;
      queryParams.push("mcq.is_delete", deletedValue);
    }

    sqlQuery += ` GROUP BY ??, ?? `;
    queryParams.push("mcq.mcq_id", "exp.mcq_explanation_id");

    const getCount = await mySqlQuery(sqlQuery, queryParams);

    sqlQuery += ` ORDER BY ?? LIMIT ? OFFSET ?`;
    queryParams.push("mcq." + sort, parseInt(size), offset);

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

  createLectureMCQs = async (lectureMcqData) => {
    const checkIfCourseLectureExist = await mySqlQuery(
      "SELECT ?? FROM ?? where ?? = ?",
      ["lecture_id", "lectures", "lecture_id", lectureMcqData.lecture_id],
    );

    if (checkIfCourseLectureExist.length == 0) {
      throw new ValidationFailedError(`Course Lecture does not exists`);
    }

    const base = {
      is_delete: 0,

      created_at: new Date(),
      updated_at: new Date(),
    };

    const newMCQsData = {
      title: lectureMcqData.title,
      description: lectureMcqData.description,
      marks: lectureMcqData.marks,
      mcq_type: lectureMcqData.mcq_type,
      ...base,
    };

    const mcqData = await mySqlQuery("INSERT INTO ?? SET ?", [
      "mcq",
      newMCQsData,
    ]);

    const newLectureMCQsData = {
      mcq_id: mcqData.insertId,
      lecture_id: checkIfCourseLectureExist[0].lecture_id,
      ...base,
    };

    await mySqlQuery("INSERT INTO ?? SET ?", [
      "lecture_mcqs",
      newLectureMCQsData,
    ]);

    const newLectureMCQExplanationData = {
      mcq_id: mcqData.insertId,
      correct_explanation: lectureMcqData.correct_explanation,
      wrong_explanation: lectureMcqData.wrong_explanation,
      ...base,
    };

    await mySqlQuery("INSERT INTO ?? SET ?", [
      "mcq_explanation",
      newLectureMCQExplanationData,
    ]);

    if (lectureMcqData.options && lectureMcqData.options.length > 0) {
      lectureMcqData.options.map(async (tag) => {
        await mySqlQuery("INSERT INTO ?? SET ?", [
          "options",
          {
            mcq_id: mcqData.insertId,
            option: tag.option,
            reason: tag.reason,
            is_correct: tag.is_correct,
            ...base,
          },
        ]);
      });
    }
    return newMCQsData;
  };

  updateLectureMCQs = async (mcq_id, lectureMcqData) => {
    const newMCQsData = {
      ...(lectureMcqData.title ? { title: lectureMcqData.title } : {}),
      ...(lectureMcqData.description
        ? { description: lectureMcqData.description }
        : {}),
      ...(lectureMcqData.marks ? { marks: lectureMcqData.marks } : {}),
      ...(lectureMcqData.mcq_type ? { mcq_type: lectureMcqData.mcq_type } : {}),
    };

    let data;

    if (Object.keys(newMCQsData).length > 0) {
      newMCQsData.updated_at = new Date();

      data = await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
        "mcq",
        newMCQsData,
        "mcq_id",
        mcq_id,
      ]);
    }

    const newMCQExplanationData = {
      ...(lectureMcqData.correct_explanation
        ? { correct_explanation: lectureMcqData.correct_explanation }
        : {}),
      ...(lectureMcqData.wrong_explanation
        ? { wrong_explanation: lectureMcqData.wrong_explanation }
        : {}),
    };

    if (Object.keys(newMCQExplanationData).length > 0) {
      newMCQExplanationData.updated_at = new Date();

      const mcq_explanation = await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
        "mcq_explanation",
        newMCQExplanationData,
        "mcq_id",
        mcq_id,
      ]);
      data.affectedRows += mcq_explanation.affectedRows;
    }

    if (lectureMcqData.options && lectureMcqData.options.length > 0) {
      let getOldMCQ = await mySqlQuery(
        "SELECT ??, ??, ??, ?? FROM ?? AS ?? where ?? = ?",
        [
          "op.option",
          "op.option_id",
          "op.reason",
          "op.is_correct",
          "options",
          "op",
          "op.mcq_id",
          mcq_id,
        ],
      );

      const deleteOldMCQData = getOldMCQ.filter(
        (option) =>
          lectureMcqData.options.findIndex(
            (tag) => tag.option == option.option,
          ) == -1,
      );

      deleteOldMCQData.map(async (tag) => {
        await mySqlQuery("DELETE FROM ?? WHERE ?? =?", [
          "options",
          "option_id",
          tag.option_id,
        ]);
      });

      const base = {
        is_delete: 0,

        created_at: new Date(),
        updated_at: new Date(),
      };

      lectureMcqData.options.map(async (tag) => {
        const existingOption = getOldMCQ.find(
          (oldOption) => oldOption.option === tag.option,
        );

        if (existingOption)
          await mySqlQuery(
            "UPDATE ?? SET ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?",
            [
              "options",
              "reason",
              tag.reason,
              "is_correct",
              tag.is_correct,
              "updated_at",
              new Date(),
              "option_id",
              existingOption.option_id,
            ],
          );
        else
          await mySqlQuery("INSERT INTO ?? SET ?", [
            "options",
            {
              mcq_id: mcq_id,
              option: tag.option,
              reason: tag.reason,
              is_correct: tag.is_correct,
              ...base,
            },
          ]);

        data.affectedRows += 1;
      });
    }

    if (data.affectedRows > 0) return newMCQsData;
    else return { msg: "No data to update" };
  };

  deleteLectureMCQs = async (mcq_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "mcq",
      "is_delete",
      1,
      "mcq_id",
      mcq_id,
    ]);
    if (data.affectedRows > 0) return "LectureMCQs deleted successfully";
    else return "LectureMCQs not found";
  };

  restoreLectureMCQsAccount = async (mcq_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "mcq",
      "is_delete",
      0,
      "mcq_id",
      mcq_id,
    ]);

    if (data.affectedRows > 0) return "LectureMCQs restored successfully";
    else return "LectureMCQs not found";
  };
}

export default LectureMCQsService;
