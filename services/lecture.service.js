import { ValidationFailedError } from "../common/errors.js";
import { mySqlQuery } from "../common/utils.js";

class LectureService {
  getAllLectures = async (query) => {
    const {
      search,
      course_module_id = 0,
      deleted, // Can be "all", "true", or "false"
      page = 1, // Default to page 1 if not provided
      size = 10, // Default to size 10 if not provided
      sort = "created_at", // Default sorting by created_at if not provided
    } = query;

    const offset = (page - 1) * size;

    let sqlQuery = `SELECT ??, ??, ??, ??, ?? AS ??, ?? AS ??,

            IF(COUNT(??), JSON_ARRAYAGG(JSON_OBJECT(
              ?, ??,
              ?, ??
            )), NULL) as ??,
            
            IF(COUNT(??), JSON_ARRAYAGG(JSON_OBJECT(
              ?, ??,
              ?, ??,
              ?, ??,
              ?, ??
            )), NULL) as ??,
              
            (SELECT COUNT(??) FROM ?? AS ?? WHERE ?? = ?? ) as ??,
            (SELECT COUNT(??) FROM ?? AS ?? LEFT JOIN ?? AS ?? ON ?? = ?? WHERE ?? = ?? ) as ??,
            (SELECT COUNT(??) FROM ?? AS ?? LEFT JOIN ?? AS ?? ON ?? = ?? WHERE ?? = ?? ) as ??

            FROM ?? as ?? 
            LEFT JOIN ?? as ?? ON ?? = ?? 
            LEFT JOIN ?? as ?? ON ?? = ?? 
            LEFT JOIN ?? as ?? ON ?? = ?? 
            LEFT JOIN ?? as ?? ON ?? = ?? 
            LEFT JOIN ?? as ?? ON ?? = ?? 
            LEFT JOIN ?? as ?? ON ?? = ?? 
            WHERE 1=1`;

    const queryParams = [
      "cl.lecture_id",
      "cl.title",
      "cl.summary",
      "cl.is_delete",
      "c.name",
      "course_name",
      "cm.title",
      "module_title",

      "lc.content_id",
      "content_id",
      "lc.content_id",
      "content_title",
      "lc.title",

      "contents",

      "u.user_id",
      "user_id",
      "u.user_id",
      "name",
      "u.name",
      "profile_image",
      "u.profile_image",
      "email",
      "u.email",
      "mentors",

      "lr.lecture_reference_id",
      "lecture_reference",
      "lr",
      "cl.lecture_id",
      "lr.lecture_id",
      "reference_count",

      "lmcq.mcq_id",
      "mcq",
      "mcq",
      "lecture_mcqs",
      "lmcq",
      "mcq.mcq_id",
      "lmcq.mcq_id",
      "cl.lecture_id",
      "lmcq.lecture_id",
      "mcq_count",

      "la.lecture_assignment_id",
      "lecture_assignments",
      "la",
      "assignments",
      "a",
      "la.assignment_id",
      "a.assignment_id",
      "cl.lecture_id",
      "la.lecture_id",
      "assignment_count",

      "lectures",
      "cl",

      "courses",
      "c",
      "cl.course_id",
      "c.course_id",

      "contents",
      "lc",
      "cl.lecture_id",
      "lc.lecture_id",

      "course_modules",
      "cm",
      "cl.course_module_id",
      "cm.course_module_id",

      "lecture_mentors",
      "lmt",
      "cl.lecture_id",
      "lmt.lecture_id",

      "mentors",
      "m",
      "lmt.mentor_id",
      "m.mentor_id",

      "users",
      "u",
      "m.user_id",
      "u.user_id",
    ];

    if (search) {
      sqlQuery += ` AND ?? LIKE ?`;
      queryParams.push("cl.title", `%${search}%`);
    }

    if (course_module_id) {
      sqlQuery += ` AND ?? = ? `;
      queryParams.push("cm.course_module_id", course_module_id);
    }

    if (deleted != "all") {
      const deletedValue = deleted === "true" ? 1 : 0;
      sqlQuery += ` AND ?? = ?`;
      queryParams.push("cl.is_delete", deletedValue);
    }

    sqlQuery += ` GROUP BY ?? `;
    queryParams.push("cl.lecture_id");

    const getCount = await mySqlQuery(sqlQuery, queryParams);

    sqlQuery += ` ORDER BY ?? LIMIT ? OFFSET ?`;
    queryParams.push(
      "cl." + (course_module_id ? "order_id" : sort),
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

  getAllLecturesTitle = async (course_module_id) => {
    const sqlQuery = `SELECT ??, ?? FROM ?? WHERE ?? = ?`;
    const queryParams = [
      "lecture_id",
      "title",
      "lectures",
      "course_module_id",
      course_module_id,
    ];

    const result = await mySqlQuery(sqlQuery, queryParams);
    return {
      result,
    };
  };

  createLecture = async (lectureData) => {
    const checkIfCourseExist = await mySqlQuery(
      "SELECT ?? FROM ?? where ?? = ?",
      ["course_id", "courses", "course_id", lectureData.course_id],
    );

    if (checkIfCourseExist.length == 0) {
      throw new ValidationFailedError(`Course does not exists`);
    }

    const checkIfCourseModuleExist = await mySqlQuery(
      "SELECT ?? FROM ?? where ?? = ?",
      [
        "course_module_id",
        "course_modules",
        "course_module_id",
        lectureData.course_module_id,
      ],
    );

    if (checkIfCourseModuleExist.length == 0) {
      throw new ValidationFailedError(`Course Module does not exists`);
    }

    const maxOrderId = await mySqlQuery(
      "select MAX(??) AS ?? from ?? where ?? = ?",
      [
        "order_id",
        "order_id",
        "lectures",
        "course_module_id",
        checkIfCourseModuleExist[0].course_module_id,
      ],
    );

    const newLectureData = {
      title: lectureData.title,
      summary: lectureData.summary,

      course_id: checkIfCourseExist[0].course_id,
      course_module_id: checkIfCourseModuleExist[0].course_module_id,
      is_delete: 0,
      order_id: maxOrderId[0].order_id + 1,

      created_at: new Date(),
      updated_at: new Date(),
    };

    const lecture = await mySqlQuery("INSERT INTO ?? SET ?", [
      "lectures",
      newLectureData,
    ]);

    if (lectureData.mentors && lectureData.mentors.length > 0) {
      const base = {
        is_delete: 0,

        created_at: new Date(),
        updated_at: new Date(),
      };

      const mentors = await mySqlQuery("SELECT ?? FROM ?? WHERE ?? in (?)", [
        "mentor_id",
        "mentors",
        "user_id",
        lectureData.mentors,
      ]);
      mentors.map(async ({ mentor_id }) => {
        await mySqlQuery("INSERT INTO ?? SET ?", [
          "lecture_mentors",
          { lecture_id: lecture.insertId, mentor_id, ...base },
        ]);
      });
    }
    return newLectureData;
  };

  updateLecture = async (lecture_id, lectureData) => {
    const updatedLectureData = {
      ...(lectureData.title ? { title: lectureData.title } : {}),
      ...(lectureData.summary ? { summary: lectureData.summary } : {}),
    };

    if (Object.keys(updatedLectureData).length > 0)
      updatedLectureData.updated_at = new Date();

    const data = await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
      "lectures",
      updatedLectureData,
      "lecture_id",
      lecture_id,
    ]);

    if (lectureData.mentors && lectureData.mentors.length > 0) {
      const getOldMentors = await mySqlQuery(
        "SELECT ??, ??, ?? FROM ?? AS ?? LEFT JOIN ?? AS ?? ON ?? = ?? where ?? = ?",
        [
          "lm.lecture_mentor_id",
          "lm.mentor_id",
          "mt.user_id",
          "lecture_mentors",
          "lm",
          "mentors",
          "mt",
          "lm.mentor_id",
          "mt.mentor_id",
          "lm.lecture_id",
          lecture_id,
        ],
      );

      const deleteOldMentorsData = getOldMentors.filter(
        (mentor) =>
          lectureData.mentors.findIndex(
            (user_id) => user_id == mentor.user_id,
          ) == -1,
      );

      lectureData.mentors = lectureData.mentors.filter(
        (user_id) =>
          getOldMentors.findIndex((mentor) => user_id == mentor.user_id) == -1,
      );

      deleteOldMentorsData.map(async (mentor) => {
        await mySqlQuery("DELETE FROM ?? WHERE?? =?", [
          "lecture_mentors",
          "lecture_mentor_id",
          mentor.lecture_mentor_id,
        ]);
      });

      const base = {
        is_delete: 0,

        created_at: new Date(),
        updated_at: new Date(),
      };

      if (lectureData.mentors && lectureData.mentors.length > 0) {
        const mentors = await mySqlQuery("SELECT ?? FROM ?? WHERE ?? in (?)", [
          "mentor_id",
          "mentors",
          "user_id",
          lectureData.mentors,
        ]);

        mentors.map(async ({ mentor_id }) => {
          await mySqlQuery("INSERT INTO ?? SET ?", [
            "lecture_mentors",
            { lecture_id: lecture_id, mentor_id, ...base },
          ]);
        });

        data.affectedRows += 1;
      }
    }

    if (data.affectedRows > 0) return updatedLectureData;
    else return { msg: "No data to update" };
  };

  deleteLecture = async (lecture_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "lectures",
      "is_delete",
      1,
      "lecture_id",
      lecture_id,
    ]);
    if (data.affectedRows > 0) return "Lecture deleted successfully";
    else return "Lecture not found";
  };

  restoreLectureAccount = async (lecture_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "lectures",
      "is_delete",
      0,
      "lecture_id",
      lecture_id,
    ]);

    if (data.affectedRows > 0) return "Lecture restored successfully";
    else return "Lecture not found";
  };

  swapLecture = async (lecture_id, action) => {
    const lecturesToSwap = await mySqlQuery(
      `SELECT ??, ?? 
     FROM ?? 
     WHERE ?? ${
       action === "INCREMENT" ? ">=" : "<="
     } (SELECT ?? FROM ?? WHERE ?? = ?) 
     AND ?? = (SELECT ?? FROM ?? WHERE ?? = ?)
     ORDER BY ?? ${action === "INCREMENT" ? "ASC" : "DESC"} 
     LIMIT ?`,
      [
        "lecture_id",
        "order_id",
        "lectures",
        "order_id",
        "order_id",
        "lectures",
        "lecture_id",
        lecture_id,
        "course_module_id",
        "course_module_id",
        "lectures",
        "lecture_id",
        lecture_id,
        "order_id",
        2,
      ],
    );

    if (lecturesToSwap.length < 2)
      throw new ValidationFailedError("Single lecture can not be swapped");

    await mySqlQuery(`UPDATE ?? SET ?? = ? WHERE ?? =?`, [
      "lectures",
      "order_id",
      lecturesToSwap[1].order_id,
      "lecture_id",
      lecturesToSwap[0].lecture_id,
    ]);

    await mySqlQuery(`UPDATE ?? SET ?? = ? WHERE ?? =?`, [
      "lectures",
      "order_id",
      lecturesToSwap[0].order_id,
      "lecture_id",
      lecturesToSwap[1].lecture_id,
    ]);
    return "Lecture swaped";
  };
}

export default LectureService;
