import { ValidationFailedError } from "../common/errors.js";
import { mySqlQuery } from "../common/utils.js";
import BaseService from "./base.service.js";

class CourseService {
  getAllCourses = async (query) => {
    const {
      search,
      deleted, // Can be "all", "true", or "false"
      page = 1, // Default to page 1 if not provided
      size = 10, // Default to size 10 if not provided
      sort = "order_id", // Default sorting by order_id if not provided
    } = query;

    const offset = (page - 1) * size;

    let sqlQuery = `SELECT ??, ??, ??, ??, ??, ??, ??, ??, JSON_OBJECT(
              ?, ??,
              ?, ??,
              ?, ??,
              ?, ??
            ) as ??, 
            (SELECT COUNT(??) FROM ?? AS ?? WHERE ?? = ?? ) as ??, 
            (SELECT COUNT(??) FROM ?? AS ?? WHERE ?? = ?? ) as ??, 
            (SELECT COUNT(??) FROM ?? AS ?? WHERE ?? = ?? ) as ?? 
            FROM ?? as ?? 
            LEFT JOIN ?? as ?? ON ?? = ?? 
            LEFT JOIN ?? as ?? ON ?? = ?? 
            WHERE 1=1`;
    const queryParams = [
      "c.course_id",
      "c.name",
      "c.description",
      "c.cost",
      "c.intro_video",
      "c.created_at",
      "c.updated_at",
      "c.is_delete",

      "user_id",
      "u.user_id",
      "name",
      "u.name",
      "email",
      "u.email",
      "profile_image",
      "u.profile_image",
      "mentor",

      "cr.course_reference_id",
      "course_reference",
      "cr",
      "c.course_id",
      "cr.course_id",
      "reference_count",

      "cm.course_module_id",
      "course_modules",
      "cm",
      "c.course_id",
      "cm.course_id",
      "module_count",

      "uc.user_course_id",
      "user_courses",
      "uc",
      "c.course_id",
      "uc.course_id",
      "purchased_users_count",

      "courses",
      "c",

      "mentors",
      "m",
      "c.mentor_id",
      "m.mentor_id",

      "users",
      "u",
      "m.user_id",
      "u.user_id",
    ];

    if (search) {
      sqlQuery += ` AND ?? LIKE ?`;
      queryParams.push("c.name", `%${search}%`);
    }

    if (deleted != "all") {
      const deletedValue = deleted === "true" ? 1 : 0;
      sqlQuery += ` AND ?? = ?`;
      queryParams.push("c.is_delete", deletedValue);
    }

    const getCount = await mySqlQuery(sqlQuery, queryParams);

    sqlQuery += ` ORDER BY ?? LIMIT ? OFFSET ?`;
    queryParams.push("c." + sort, parseInt(size), offset);

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

  getAllCoursesTitle = async () => {
    const sqlQuery = `SELECT ??, ?? FROM ??`;
    const queryParams = ["course_id", "name", "courses"];

    const result = await mySqlQuery(sqlQuery, queryParams);
    return {
      result,
    };
  };

  createCourse = async (courseData) => {
    const checkIfMentorExist = await mySqlQuery(
      "SELECT ?? FROM ?? where ?? = ?",
      ["mentor_id", "mentors", "user_id", courseData.mentor_id],
    );

    const maxOrderId = await mySqlQuery("select MAX(??) AS ?? from ??", [
      "order_id",
      "order_id",
      "courses",
    ]);

    if (checkIfMentorExist.length == 0) {
      throw new ValidationFailedError(`Mentor does not exists`);
    }

    const newCourseData = {
      name: courseData.name,
      description: courseData.description,
      cost: courseData.cost,
      intro_video: courseData.intro_video,
      mentor_id: checkIfMentorExist[0].mentor_id,
      order_id: maxOrderId[0].order_id + 1,
      is_delete: 0,

      created_at: new Date(),
      updated_at: new Date(),
    };

    await mySqlQuery("INSERT INTO ?? SET ?", ["courses", newCourseData]);
    newCourseData.mentor_id = courseData.mentor_id;
    return newCourseData;
  };

  updateCourse = async (course_id, courseData) => {
    let mentor_id = 0;
    if (courseData.mentor_id) {
      const checkIfMentorExist = await mySqlQuery(
        "SELECT ?? FROM ?? where ?? = ?",
        ["mentor_id", "mentors", "user_id", courseData.mentor_id],
      );

      if (checkIfMentorExist.length == 0) {
        throw new ValidationFailedError(`Mentor does not exists`);
      }
      mentor_id = checkIfMentorExist[0].mentor_id;
    }

    const updatedCourseData = {
      ...(courseData.name ? { name: courseData.name } : {}),

      ...(courseData.description
        ? { description: courseData.description }
        : {}),

      ...(courseData.cost ? { cost: courseData.cost } : {}),

      ...(courseData.intro_video
        ? { intro_video: courseData.intro_video }
        : {}),

      ...(mentor_id ? { mentor_id: mentor_id } : {}),
    };

    if (Object.keys(updatedCourseData).length > 0)
      updatedCourseData.updated_at = new Date();

    if (updatedCourseData.intro_video) {
      const course = await mySqlQuery("SELECT ?? FROM?? WHERE?? =?", [
        "intro_video",
        "courses",
        "course_id",
        course_id,
      ]);
      if (course[0].intro_video != updatedCourseData.intro_video) {
        await BaseService.deleteObjectByUrl(course[0].intro_video);
      }
    }

    await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
      "courses",
      updatedCourseData,
      "course_id",
      course_id,
    ]);

    return updatedCourseData;
  };

  swapCourse = async (course_id, action) => {
    const coursesToSwap = await mySqlQuery(
      `SELECT ??, ?? 
     FROM ?? 
     WHERE ?? ${
       action === "INCREMENT" ? ">=" : "<="
     } (SELECT ?? FROM ?? WHERE ?? = ?) 
     ORDER BY ?? ${action === "INCREMENT" ? "ASC" : "DESC"} 
     LIMIT ?`,
      [
        "course_id",
        "order_id",
        "courses",
        "order_id",
        "order_id",
        "courses",
        "course_id",
        course_id,
        "order_id",
        2,
      ],
    );

    if (coursesToSwap.length < 2)
      throw new ValidationFailedError("Single course can not be swapped");

    await mySqlQuery(`UPDATE ?? SET ?? = ? WHERE ?? =?`, [
      "courses",
      "order_id",
      coursesToSwap[1].order_id,
      "course_id",
      coursesToSwap[0].course_id,
    ]);

    await mySqlQuery(`UPDATE ?? SET ?? = ? WHERE ?? =?`, [
      "courses",
      "order_id",
      coursesToSwap[0].order_id,
      "course_id",
      coursesToSwap[1].course_id,
    ]);
    return "Course swaped";
  };

  deleteCourse = async (course_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "courses",
      "is_delete",
      1,
      "course_id",
      course_id,
    ]);
    if (data.affectedRows > 0) return "Course deleted successfully";
    else return "Course not found";
  };

  restoreCourseAccount = async (course_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "courses",
      "is_delete",
      0,
      "course_id",
      course_id,
    ]);

    if (data.affectedRows > 0) return "Course restored successfully";
    else return "Course not found";
  };
}

export default CourseService;
