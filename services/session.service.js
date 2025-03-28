import { ValidationFailedError } from "../common/errors.js";
import { mySqlQuery } from "../common/utils.js";
import dotenv from "dotenv";
import NotificationService from "./notification.service.js";
dotenv.config();

class SessionService {
  calculateDuration(starttime, endtime) {
    // Extract hours, minutes, and seconds from the number format
    const startHours = Math.floor(starttime / 10000);
    const startMinutes = Math.floor((starttime % 10000) / 100);
    const startSeconds = starttime % 100;

    const endHours = Math.floor(endtime / 10000);
    const endMinutes = Math.floor((endtime % 10000) / 100);
    const endSeconds = endtime % 100;

    // Convert starttime and endtime to total seconds
    const startTotalSeconds =
      startHours * 3600 + startMinutes * 60 + startSeconds;
    const endTotalSeconds = endHours * 3600 + endMinutes * 60 + endSeconds;

    // Calculate the duration in seconds
    let durationSeconds;
    if (endTotalSeconds >= startTotalSeconds) {
      // If endtime is later in the day
      durationSeconds = endTotalSeconds - startTotalSeconds;
    } else {
      // If endtime is on the next day (i.e., after midnight)
      durationSeconds = 24 * 3600 - startTotalSeconds + endTotalSeconds;
    }

    // Convert durationSeconds back to hours, minutes, and seconds
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const seconds = durationSeconds % 60;

    // Format the result as HH:MM:SS
    const formattedDuration = `${String(hours).padStart(2, "0")}:${String(
      minutes,
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    return formattedDuration;
  }

  getZoomAccessToken = async () => {
    const zoomApiKey = process.env.ZOOM_API_KEY;
    const zoomApiSecret = process.env.ZOOM_API_SECRET;
    const tokenUrl = "https://zoom.us/oauth/token";
    const accountID = process.env.ZOOM_ACCOUNT_ID;

    const credentials = `${zoomApiKey}:${zoomApiSecret}`;
    const buffer = Buffer.from(credentials, "utf-8");
    const zoomAuth = buffer.toString("base64");

    const requestBody = new URLSearchParams({
      account_id: accountID,
      grant_type: "account_credentials",
    });

    try {
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${zoomAuth}`,
        },
        body: requestBody.toString(),
      });

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      throw new Error(
        `Error while fetching Zoom access token: ${
          error.response?.data?.message || error.message
        }`,
      );
    }
  };

  getZoomMeetingLink = async (time, agenda) => {
    const body = {
      agenda: agenda,
      default_password: true,
      duration: 60,
      settings: {
        approval_type: 2, // auto approve
        jbh_time: 10, // allow participants to join 10 minutes before
        join_before_host: true,
        participant_limit: 2,
      },
      topic: agenda,
      type: 2,
      start_time: time,
      timezone: "Asia/Calcutta",
    };

    try {
      const accessToken = await this.getZoomAccessToken();
      const meetingUrl = "https://api.zoom.us/v2/users/me/meetings";

      const res = await fetch(meetingUrl, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      return data.join_url;
    } catch (error) {
      throw new Error(
        `Error while creating Zoom meeting link: ${
          error.response?.data?.message || error.message
        }`,
      );
    }
  };

  getAllSessions = async (query) => {
    const {
      search,
      deleted, // Can be "all", "true", or "false"
      page = 1, // Default to page 1 if not provided
      size = 10, // Default to size 10 if not provided
      sort = "created_at", // Default sorting by created_at if not provided
    } = query;

    const offset = (page - 1) * size;

    let sqlQuery = `SELECT ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, 
            IF(COUNT(??), JSON_ARRAYAGG(??), NULL) AS ??,

            JSON_OBJECT(
              ?, ??,
              ?, ??,
              ?, ??,
              ?, ??
            ) as ??, 
            
            (SELECT COUNT(??) FROM ?? AS ?? WHERE ?? = ?? ) as ??
            
            FROM ?? as ?? 
            LEFT JOIN ?? as ?? ON ?? = ??
            LEFT JOIN ?? as ?? ON ?? = ??
            LEFT JOIN ?? as ?? ON ?? = ??
            LEFT JOIN ?? as ?? ON ?? = ??
            WHERE 1=1`;

    const queryParams = [
      "s.session_id",
      "s.time",
      "s.availability",
      "s.cost",
      "s.is_paid",
      "s.title",
      "s.zoom_link",
      "s.subtitle",
      "s.starttime",
      "s.endtime",
      "s.duration",
      "s.is_delete",

      "sa.agenda_id",
      "sa.agenda",
      "agenda",

      "user_id",
      "u.user_id",
      "name",
      "u.name",
      "email",
      "u.email",
      "profile_image",
      "u.profile_image",
      "mentor",

      "sc.id",
      "user_calendar_events",
      "sc",
      "sc.session_id",
      "s.session_id",
      "total_attendees",

      "sessions",
      "s",

      "session_agenda",
      "sa",
      "s.session_id",
      "sa.session_id",

      "mentor_sessions",
      "ms",
      "s.session_id",
      "ms.session_id",

      "mentors",
      "m",
      "ms.mentor_id",
      "m.mentor_id",

      "users",
      "u",
      "m.user_id",
      "u.user_id",
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

    sqlQuery += ` GROUP BY ??, ?? `;
    queryParams.push("s.session_id", "ms.mentor_id");

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

  createSession = async (sessionData) => {
    const checkIfMentorExist = await mySqlQuery(
      "SELECT ?? FROM ?? where ?? = ?",
      ["mentor_id", "mentors", "user_id", sessionData.mentor],
    );

    if (checkIfMentorExist.length == 0) {
      throw new ValidationFailedError(`Mentor does not exists`);
    }

    const newSessionData = {
      time: sessionData.time?.split("T")[0],
      availability: sessionData.availability,
      cost: sessionData.cost,
      is_paid: sessionData.is_paid,
      title: sessionData.title,
      subtitle: sessionData.subtitle,
      starttime: sessionData.starttime,
      endtime: sessionData.endtime,

      duration: this.calculateDuration(
        sessionData.starttime,
        sessionData.endtime,
      ),

      zoom_link: await this.getZoomMeetingLink(
        sessionData.time,
        sessionData.agendas.join("\n"),
      ),

      is_delete: 0,

      created_at: new Date(),
      updated_at: new Date(),
    };

    const session = await mySqlQuery("INSERT INTO ?? SET ?", [
      "sessions",
      newSessionData,
    ]);

    await mySqlQuery("INSERT INTO ?? SET ?", [
      "mentor_sessions",
      {
        session_id: session.insertId,
        mentor_id: checkIfMentorExist[0].mentor_id,
        is_delete: 0,

        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    if (sessionData.agendas && sessionData.agendas.length > 0) {
      const base = {
        session_id: session.insertId,

        is_delete: 0,

        created_at: new Date(),
        updated_at: new Date(),
      };

      sessionData.agendas.map(async (value) => {
        await mySqlQuery("INSERT INTO ?? SET ?", [
          "session_agenda",
          { agenda: value, ...base },
        ]);
      });
    }
    await NotificationService.notifySessionCreationToAllUsers();

    return newSessionData;
  };

  updateSession = async (session_id, sessionData) => {
    const updatedSessionData = {
      ...(sessionData.time ? { time: sessionData.time.split("T")[0] } : {}),
      ...(sessionData.availability
        ? { availability: sessionData.availability }
        : {}),
      ...(sessionData.cost ? { cost: sessionData.cost } : {}),
      ...(sessionData.is_paid ? { is_paid: sessionData.is_paid } : {}),
      ...(sessionData.title ? { title: sessionData.title } : {}),
      ...(sessionData.subtitle ? { subtitle: sessionData.subtitle } : {}),
      ...(sessionData.starttime ? { starttime: sessionData.starttime } : {}),
      ...(sessionData.endtime ? { endtime: sessionData.endtime } : {}),
    };

    if (Object.keys(updatedSessionData).length > 0)
      updatedSessionData.updated_at = new Date();

    const data = await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
      "sessions",
      updatedSessionData,
      "session_id",
      session_id,
    ]);

    if (sessionData.starttime || sessionData.endtime) {
      let sqlQuery = `SELECT ??, ??

            FROM ?? as ?? 
            WHERE ?? = ?`;

      const queryParams = [
        "s.starttime",
        "s.endtime",

        "sessions",
        "s",
        "session_id",
        session_id,
      ];

      await mySqlQuery(sqlQuery, queryParams);

      await mySqlQuery("UPDATE ?? SET ? WHERE ?? = ?", [
        "sessions",
        {
          duration: this.calculateDuration(
            sessionData.starttime,
            sessionData.endtime,
          ),
        },
        "session_id",
        session_id,
      ]);
    }

    if (sessionData.agendas && sessionData.agendas.length > 0) {
      let getOldAgendas = await mySqlQuery(
        "SELECT ??, ?? FROM ?? where ?? = ?",
        ["agenda_id", "agenda", "session_agenda", "session_id", session_id],
      );

      const deleteOldAgendasData = getOldAgendas.filter(
        (row) =>
          sessionData.agendas.findIndex((tag) => tag == row.agenda) == -1,
      );

      sessionData.agendas = sessionData.agendas.filter(
        (tag) => getOldAgendas.findIndex((row) => tag == row.agenda) == -1,
      );

      deleteOldAgendasData.map(async (row) => {
        await mySqlQuery("DELETE FROM ?? WHERE?? =?", [
          "session_agenda",
          "agenda_id",
          row.agenda_id,
        ]);
      });

      const base = {
        session_id,
        is_delete: 0,

        created_at: new Date(),
        updated_at: new Date(),
      };

      sessionData.agendas.map(async (tag) => {
        await mySqlQuery("INSERT INTO ?? SET ?", [
          "session_agenda",
          { agenda: tag, ...base },
        ]);

        data.affectedRows += 1;
      });
    }

    if (data.affectedRows > 0) return updatedSessionData;
    else return { msg: "No data to update" };
  };

  deleteSession = async (session_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "sessions",
      "is_delete",
      1,
      "session_id",
      session_id,
    ]);
    if (data.affectedRows > 0) return "Session deleted successfully";
    else return "Session not found";
  };

  restoreSession = async (session_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "sessions",
      "is_delete",
      0,
      "session_id",
      session_id,
    ]);

    if (data.affectedRows > 0) return "Session restored successfully";
    else return "Session not found";
  };
}

export default SessionService;
