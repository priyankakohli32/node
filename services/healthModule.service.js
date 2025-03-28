import { ValidationFailedError } from "../common/errors.js";
import { mySqlQuery } from "../common/utils.js";
import BaseService from "./base.service.js";

class HealthModuleService {
  getAllHealthModules = async (query) => {
    const {
      search,
      deleted, // Can be "all", "true", or "false"
      page = 1, // Default to page 1 if not provided
      size = 10, // Default to size 10 if not provided
      sort = "created_at", // Default sorting by created_at if not provided
    } = query;

    const offset = (page - 1) * size;

    let sqlQuery = `SELECT ??, ??, ??, ??, ??, ??, ??
            FROM ?? as ?? 
            WHERE 1=1`;

    const queryParams = [
      "hm.health_module_id",
      "hm.title",
      "hm.preview_image",
      "hm.time",
      "hm.about",
      "hm.video",
      "hm.is_delete",

      "health_modules",
      "hm",
    ];

    if (search) {
      sqlQuery += ` AND ?? LIKE ?`;
      queryParams.push("hm.title", `%${search}%`);
    }

    if (deleted != "all") {
      const deletedValue = deleted === "true" ? 1 : 0;
      sqlQuery += ` AND ?? = ?`;
      queryParams.push("hm.is_delete", deletedValue);
    }

    const getCount = await mySqlQuery(sqlQuery, queryParams);

    sqlQuery += ` ORDER BY ?? LIMIT ? OFFSET ?`;
    queryParams.push("hm." + sort, parseInt(size), offset);

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

  createHealthModule = async (healthModuleData) => {
    const newHealthModuleData = {
      title: healthModuleData.title,
      preview_image: healthModuleData.preview_image,
      time: healthModuleData.time,
      about: healthModuleData.about,
      video: healthModuleData.video,

      is_delete: 0,

      created_at: new Date(),
      updated_at: new Date(),
    };

    await mySqlQuery("INSERT INTO ?? SET ?", [
      "health_modules",
      newHealthModuleData,
    ]);

    return newHealthModuleData;
  };

  updateHealthModule = async (health_module_id, healthModuleData) => {
    const updatedHealthModuleData = {
      ...(healthModuleData.title ? { title: healthModuleData.title } : {}),
      ...(healthModuleData.preview_image
        ? { preview_image: healthModuleData.preview_image }
        : {}),
      ...(healthModuleData.time ? { time: healthModuleData.time } : {}),
      ...(healthModuleData.about ? { about: healthModuleData.about } : {}),
      ...(healthModuleData.video ? { video: healthModuleData.video } : {}),
    };

    if (Object.keys(updatedHealthModuleData).length > 0)
      updatedHealthModuleData.updated_at = new Date();

    if (updatedHealthModuleData.preview_image) {
      const healthModule = await mySqlQuery("SELECT ?? FROM?? WHERE?? =?", [
        "preview_image",
        "health_modules",
        "health_module_id",
        health_module_id,
      ]);
      if (
        healthModule[0].preview_image != updatedHealthModuleData.preview_image
      ) {
        await BaseService.deleteObjectByUrl(healthModule[0].preview_image);
      }
    }

    if (updatedHealthModuleData.video) {
      const healthModule = await mySqlQuery("SELECT ?? FROM?? WHERE?? =?", [
        "video",
        "health_modules",
        "health_module_id",
        health_module_id,
      ]);
      if (healthModule[0].video != updatedHealthModuleData.video) {
        await BaseService.deleteObjectByUrl(healthModule[0].video);
      }
    }

    const data = await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
      "health_modules",
      updatedHealthModuleData,
      "health_module_id",
      health_module_id,
    ]);

    if (data.affectedRows > 0) return updatedHealthModuleData;
    else return { msg: "No data to update" };
  };

  deleteHealthModule = async (health_module_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "health_modules",
      "is_delete",
      1,
      "health_module_id",
      health_module_id,
    ]);
    if (data.affectedRows > 0) return "HealthModule deleted successfully";
    else return "HealthModule not found";
  };

  restoreHealthModule = async (health_module_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "health_modules",
      "is_delete",
      0,
      "health_module_id",
      health_module_id,
    ]);

    if (data.affectedRows > 0) return "HealthModule restored successfully";
    else return "HealthModule not found";
  };
}

export default HealthModuleService;
