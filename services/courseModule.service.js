import { ValidationFailedError } from "../common/errors.js";
import { mySqlQuery } from "../common/utils.js";
import BaseService from "./base.service.js";

class CourseModuleService {
  getAllCourseModules = async (query) => {
    const {
      search,
      course_id = 0,
      deleted, // Can be "all", "true", or "false"
      page = 1, // Default to page 1 if not provided
      size = 10, // Default to size 10 if not provided
      sort = "created_at", // Default sorting by created_at if not provided
    } = query;

    const offset = (page - 1) * size;

    let sqlQuery = `SELECT ??, ??, ??, ??, ??, ?? AS ??, ?? AS ??,
            IF(COUNT(??), JSON_ARRAYAGG(JSON_OBJECT(
              ?, ??,
              ?, ??
            )), NULL) as ??,
              
            (SELECT COUNT(??) FROM ?? AS ?? WHERE ?? = ?? ) as ??
            FROM ?? as ?? 
            LEFT JOIN ?? as ?? ON ?? = ?? 
            LEFT JOIN ?? as ?? ON ?? = ?? 
            LEFT JOIN ?? as ?? ON ?? = ?? 
            WHERE 1=1`;

    const queryParams = [
      "cm.course_module_id",
      "cm.description",
      "cm.thumbnail",
      "cm.is_delete",
      "cm.course_module_id",
      "cm.title",
      "module_title",
      "c.name",
      "course_name",

      "mt.module_tag_id",
      "module_tag_id",
      "mt.module_tag_id",
      "name",
      "mt.name",
      "module_tags",

      "cl.lecture_id",
      "lectures",
      "cl",
      "cm.course_module_id",
      "cl.course_module_id",
      "lectures_count",

      "course_modules",
      "cm",

      "courses",
      "c",
      "cm.course_id",
      "c.course_id",

      "course_module_tags",
      "cmt",
      "cm.course_module_id",
      "cmt.course_modules_id",

      "module_tags",
      "mt",
      "cmt.module_tags_id",
      "mt.module_tag_id",
    ];

    if (search) {
      sqlQuery += ` AND ?? LIKE ?`;
      queryParams.push("module", `%${search}%`);
    }

    if (course_id) {
      sqlQuery += ` AND ?? = ? `;
      queryParams.push("cm.course_id", course_id);
    }

    if (deleted != "all") {
      const deletedValue = deleted === "true" ? 1 : 0;
      sqlQuery += ` AND ?? = ?`;
      queryParams.push("cm.is_delete", deletedValue);
    }

    sqlQuery += ` GROUP BY ?? `;
    queryParams.push("cm.course_module_id");

    const getCount = await mySqlQuery(sqlQuery, queryParams);

    sqlQuery += ` ORDER BY ?? LIMIT ? OFFSET ?`;
    queryParams.push(
      "cm." + (course_id ? "order_id" : sort),
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

  getAllCourseModulesTitle = async (course_id) => {
    const sqlQuery = `SELECT ??, ?? FROM ?? WHERE ?? = ?`;
    const queryParams = [
      "course_module_id",
      "title",
      "course_modules",
      "course_id",
      course_id,
    ];

    const result = await mySqlQuery(sqlQuery, queryParams);
    return {
      result,
    };
  };

  createCourseModule = async (courseModuleData) => {
    const checkIfCourseExist = await mySqlQuery(
      "SELECT ?? FROM ?? where ?? = ?",
      ["course_id", "courses", "course_id", courseModuleData.course_id],
    );

    if (checkIfCourseExist.length == 0) {
      throw new ValidationFailedError(`Course does not exists`);
    }

    const maxOrderId = await mySqlQuery(
      "select MAX(??) AS ?? from ?? where ?? = ?",
      [
        "order_id",
        "order_id",
        "course_modules",
        "course_id",
        checkIfCourseExist[0].course_id,
      ],
    );

    const newCourseModuleData = {
      title: courseModuleData.title,
      description: courseModuleData.description,
      thumbnail: courseModuleData.thumbnail,

      course_id: checkIfCourseExist[0].course_id,
      is_delete: 0,

      order_id: maxOrderId[0].order_id + 1,

      created_at: new Date(),
      updated_at: new Date(),
    };

    const course_module = await mySqlQuery("INSERT INTO ?? SET ?", [
      "course_modules",
      newCourseModuleData,
    ]);

    if (
      courseModuleData.module_tags &&
      courseModuleData.module_tags.length > 0
    ) {
      const base = {
        is_delete: 0,

        created_at: new Date(),
        updated_at: new Date(),
      };
      courseModuleData.module_tags.map(async (tag) => {
        const module_tag = await mySqlQuery("INSERT INTO ?? SET ?", [
          "module_tags",
          { name: tag.lable, ...base },
        ]);

        await mySqlQuery("INSERT INTO ?? SET ?", [
          "course_module_tags",
          {
            course_modules_id: course_module.insertId,
            module_tags_id: module_tag.insertId,
            ...base,
          },
        ]);
      });
    }
    return newCourseModuleData;
  };

  updateCourseModule = async (course_module_id, courseModuleData) => {
    let course_id = 0;
    if (courseModuleData.course_id) {
      const checkIfCourseExist = await mySqlQuery(
        "SELECT ?? FROM ?? where ?? = ?",
        ["course_id", "courses", "course_id", courseModuleData.course_id],
      );

      if (checkIfCourseExist.length == 0) {
        throw new ValidationFailedError(`Course does not exists`);
      }
      course_id = checkIfCourseExist[0].course_id;
    }

    const updatedCourseModuleData = {
      ...(courseModuleData.title ? { title: courseModuleData.title } : {}),
      ...(courseModuleData.description
        ? { description: courseModuleData.description }
        : {}),
      ...(courseModuleData.thumbnail
        ? { thumbnail: courseModuleData.thumbnail }
        : {}),

      ...(course_id ? { course_id: course_id } : {}),
    };

    if (Object.keys(updatedCourseModuleData).length > 0)
      updatedCourseModuleData.updated_at = new Date();

    if (courseModuleData.thumbnail) {
      const course_module = await mySqlQuery("SELECT ?? FROM?? WHERE?? =?", [
        "thumbnail",
        "course_modules",
        "course_module_id",
        course_module_id,
      ]);
      if (course_module[0].thumbnail != courseModuleData.thumbnail) {
        await BaseService.deleteObjectByUrl(course_module[0].thumbnail);
      }
    }

    const data = await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
      "course_modules",
      updatedCourseModuleData,
      "course_module_id",
      course_module_id,
    ]);

    if (
      courseModuleData.module_tags &&
      courseModuleData.module_tags.length > 0
    ) {
      let getOldModules = await mySqlQuery(
        "SELECT ??, ??, ?? FROM ?? AS ?? LEFT JOIN ?? AS ?? ON ?? = ?? where ?? = ?",
        [
          "cm.course_module_tag_id",
          "cm.module_tags_id",
          "mt.name",
          "course_module_tags",
          "cm",
          "module_tags",
          "mt",
          "cm.module_tags_id",
          "mt.module_tag_id",
          "cm.course_modules_id",
          course_module_id,
        ],
      );
      console.log(courseModuleData.module_tags, getOldModules);

      const deleteOldModulesData = getOldModules.filter(
        (module_tag) =>
          courseModuleData.module_tags.findIndex(
            (tag) => tag.lable == module_tag.name,
          ) == -1,
      );

      courseModuleData.module_tags = courseModuleData.module_tags.filter(
        (tag) =>
          getOldModules.findIndex(
            (module_tag) => tag.lable == module_tag.name,
          ) == -1,
      );

      deleteOldModulesData.map(async (tag) => {
        await mySqlQuery("DELETE FROM ?? WHERE?? =?", [
          "course_module_tags",
          "course_module_tag_id",
          tag.course_module_tag_id,
        ]);

        await mySqlQuery("DELETE FROM ?? WHERE?? =?", [
          "module_tags",
          "module_tag_id",
          tag.module_tags_id,
        ]);
      });

      const base = {
        is_delete: 0,

        created_at: new Date(),
        updated_at: new Date(),
      };

      courseModuleData.module_tags.map(async (tag) => {
        const module_tag = await mySqlQuery("INSERT INTO ?? SET ?", [
          "module_tags",
          { name: tag.lable, ...base },
        ]);

        await mySqlQuery("INSERT INTO ?? SET ?", [
          "course_module_tags",
          {
            course_modules_id: course_module_id,
            module_tags_id: module_tag.insertId,
            ...base,
          },
        ]);
        data.affectedRows += 1;
      });
    }

    if (data.affectedRows > 0) return updatedCourseModuleData;
    else return { msg: "No data to update" };
  };

  swapCourseModule = async (course_module_id, action) => {
    const coursesModuleToSwap = await mySqlQuery(
      `SELECT ??, ?? 
     FROM ?? 
     WHERE ?? ${
       action === "INCREMENT" ? ">=" : "<="
     } (SELECT ?? FROM ?? WHERE ?? = ?) 
     AND ?? = (SELECT ?? FROM ?? WHERE ?? = ?)
     ORDER BY ?? ${action === "INCREMENT" ? "ASC" : "DESC"} 
     LIMIT ?`,
      [
        "course_module_id",
        "order_id",
        "course_modules",
        "order_id",
        "order_id",
        "course_modules",
        "course_module_id",
        course_module_id,
        "course_id",
        "course_id",
        "course_modules",
        "course_module_id",
        course_module_id,
        "order_id",
        2,
      ],
    );

    if (coursesModuleToSwap.length < 2)
      throw new ValidationFailedError(
        "Single course module can not be swapped",
      );

    await mySqlQuery(`UPDATE ?? SET ?? = ? WHERE ?? =?`, [
      "course_modules",
      "order_id",
      coursesModuleToSwap[1].order_id,
      "course_module_id",
      coursesModuleToSwap[0].course_module_id,
    ]);

    await mySqlQuery(`UPDATE ?? SET ?? = ? WHERE ?? =?`, [
      "course_modules",
      "order_id",
      coursesModuleToSwap[0].order_id,
      "course_module_id",
      coursesModuleToSwap[1].course_module_id,
    ]);
    return "Course Module swaped";
  };

  deleteCourseModule = async (course_module_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "course_modules",
      "is_delete",
      1,
      "course_module_id",
      course_module_id,
    ]);
    if (data.affectedRows > 0) return "CourseModule deleted successfully";
    else return "CourseModule not found";
  };

  restoreCourseModuleAccount = async (course_module_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "course_modules",
      "is_delete",
      0,
      "course_module_id",
      course_module_id,
    ]);

    if (data.affectedRows > 0) return "CourseModule restored successfully";
    else return "CourseModule not found";
  };
}

export default CourseModuleService;
