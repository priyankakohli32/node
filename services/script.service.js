import { ValidationFailedError } from "../common/errors.js";
import { mySqlQuery } from "../common/utils.js";
import NotificationService from "./notification.service.js";

class ScriptService {
  calculateReadingTime(text) {
    const wordsPerSecond = 4;
    const words = text.trim().split(/\s+/).length;
    const secondToRead = Math.ceil(words / wordsPerSecond);
    return secondToRead;
  }

  getAllScripts = async (query) => {
    const {
      search,
      deleted, // Can be "all", "true", or "false"
      page = 1, // Default to page 1 if not provided
      size = 10, // Default to size 10 if not provided
      sort = "created_at", // Default sorting by created_at if not provided
    } = query;

    const offset = (page - 1) * size;

    let sqlQuery = `SELECT ??, ??, ??, ??, ??, ??, ??, ??, ??, ??

            FROM ?? as ?? 
            WHERE 1=1`;

    const queryParams = [
      "s.script_id",
      "s.title",
      "s.is_delete",
      "s.script_type",
      "s.minutes_to_read",
      "s.no_of_characters",
      "s.written_by",
      "s.synopsis",
      "s.performance_notes",
      "s.script_text",

      "scripts",
      "s",
    ];

    if (search) {
      sqlQuery += ` AND ?? LIKE ?`;
      queryParams.push("s.title", `%${search}%`);
    }

    if (deleted != "all") {
      const deletedValue = deleted === "true" ? 1 : 0;
      sqlQuery += ` AND ?? = ?`;
      queryParams.push("s.is_delete", deletedValue);
    }

    const getCount = await mySqlQuery(sqlQuery, queryParams);

    sqlQuery += ` ORDER BY ?? LIMIT ? OFFSET ?`;
    queryParams.push("s." + sort, parseInt(size), offset);

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

  createScript = async (scriptData) => {
    const newScriptData = {
      title: scriptData.title,
      no_of_characters: scriptData.no_of_characters,
      written_by: scriptData.written_by,
      synopsis: scriptData.synopsis,
      performance_notes: scriptData.performance_notes,
      script_text: scriptData.script_text,
      script_type: scriptData.script_type,

      minutes_to_read: this.calculateReadingTime(
        scriptData.synopsis + " " + scriptData.script_text,
      ),

      is_delete: 0,

      created_at: new Date(),
      updated_at: new Date(),
    };

    await mySqlQuery("INSERT INTO ?? SET ?", ["scripts", newScriptData]);
    await NotificationService.notifyResourceCreationToAllUsers();

    return newScriptData;
  };

  updateScript = async (script_id, scriptData) => {
    const updatedScriptData = {
      ...(scriptData.title ? { title: scriptData.title } : {}),
      ...(scriptData.no_of_characters
        ? { no_of_characters: scriptData.no_of_characters }
        : {}),
      ...(scriptData.written_by ? { written_by: scriptData.written_by } : {}),
      ...(scriptData.synopsis ? { synopsis: scriptData.synopsis } : {}),
      ...(scriptData.performance_notes
        ? { performance_notes: scriptData.performance_notes }
        : {}),
      ...(scriptData.script_text
        ? { script_text: scriptData.script_text }
        : {}),
      ...(scriptData.script_type
        ? { script_type: scriptData.script_type }
        : {}),
      ...(scriptData.synopsis && scriptData.script_text
        ? {
            minutes_to_read: this.calculateReadingTime(
              scriptData.synopsis + " " + scriptData.script_text,
            ),
          }
        : {}),
    };

    if (Object.keys(updatedScriptData).length > 0)
      updatedScriptData.updated_at = new Date();

    const data = await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
      "scripts",
      updatedScriptData,
      "script_id",
      script_id,
    ]);

    if (
      (scriptData.synopsis || scriptData.script_text) &&
      !(scriptData.synopsis && scriptData.script_text)
    ) {
      let sqlQuery = `SELECT ??, ??

            FROM ?? as ?? 
            WHERE ?? = ?`;

      const queryParams = [
        "s.synopsis",
        "s.script_text",

        "scripts",
        "s",
        "script_id",
        script_id,
      ];

      await mySqlQuery(sqlQuery, queryParams);

      await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
        "scripts",
        {
          minutes_to_read: this.calculateReadingTime(
            scriptData.synopsis + " " + scriptData.script_text,
          ),
        },
        "script_id",
        script_id,
      ]);
    }

    if (data.affectedRows > 0) return updatedScriptData;
    else return { msg: "No data to update" };
  };

  deleteScript = async (script_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "scripts",
      "is_delete",
      1,
      "script_id",
      script_id,
    ]);
    if (data.affectedRows > 0) return "Script deleted successfully";
    else return "Script not found";
  };

  restoreScript = async (script_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "scripts",
      "is_delete",
      0,
      "script_id",
      script_id,
    ]);

    if (data.affectedRows > 0) return "Script restored successfully";
    else return "Script not found";
  };
}

export default ScriptService;
