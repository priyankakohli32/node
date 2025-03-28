import { emailTemplate } from "../common/emailTemplate.js";
import { encryptString, mySqlQuery } from "../common/utils.js";
import EmailService from "./mail.service.js";

class UserService {
  getAllUsers = async (query) => {
    const {
      usertype, // Can be "mentor", "admin", or "student"
      search,
      deleted, // Can be "all", "true", or "false"
      page = 1, // Default to page 1 if not provided
      size = 10, // Default to size 10 if not provided
      sort = "created_at", // Default sorting by created_at if not provided
    } = query;

    const offset = (page - 1) * size;

    let sqlQuery = `SELECT ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??`;
    const queryParams = [
      "u.user_id",
      "u.email",
      "u.name",
      "u.age",
      "u.country_code",
      "u.phone",
      "u.watsapp_updates",
      "u.dob",
      "u.is_verified",
      "u.profile_image",
      "u.user_source",
      "u.profile_complete",
      "u.is_delete",
    ];

    if (usertype == "mentor") {
      sqlQuery += `, ??, ??, ??, ??, ??, ?? FROM ?? AS ?? LEFT JOIN ?? AS ?? ON ?? = ??`;
      queryParams.push(
        "m.experties",
        "m.experience",
        "m.linked_in_link",
        "m.twitter_link",
        "m.instagram_link",
        "m.about",
        "users",
        "u",
        "mentors",
        "m",
        "u.user_id",
        "m.user_id",
      );
    } else {
      sqlQuery += ` FROM ?? AS ??`;
      queryParams.push("users", "u");
    }

    sqlQuery += " WHERE 1=1 ";

    if (search) {
      sqlQuery += ` AND (?? LIKE ? OR ?? LIKE ?)`;
      queryParams.push("name", `%${search}%`, "email", `%${search}%`);
    }

    if (usertype) {
      const usertypeMap = {
        admin: 1,
        mentor: 2,
        student: 3,
      };
      sqlQuery += ` AND ?? = ?`;
      queryParams.push("role_id", usertypeMap[usertype]);
    }
    if (deleted != "all") {
      const deletedValue = deleted === "true" ? 1 : 0;
      sqlQuery += ` AND ?? = ?`;
      queryParams.push("u.is_delete", deletedValue);
    }

    const getCount = await mySqlQuery(sqlQuery, queryParams);

    sqlQuery += ` ORDER BY ?? ${
      sort == "created_at" ? "DESC" : ""
    } LIMIT ? OFFSET ?`;
    queryParams.push("u." + sort, parseInt(size), offset);

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

  getUserShortDetail = async (query) => {
    const {
      usertype, // Can be "mentor", "admin", or "student"
      search,
    } = query;

    let sqlQuery = `SELECT ??, ??, ??, ?? FROM ?? WHERE 1=1 `;
    const queryParams = ["user_id", "email", "name", "profile_image", "users"];

    if (search) {
      sqlQuery += ` AND (?? LIKE ? OR ?? LIKE ?)`;
      queryParams.push("name", `%${search}%`, "email", `%${search}%`);
    }

    if (usertype) {
      const usertypeMap = {
        admin: 1,
        mentor: 2,
        student: 3,
      };
      sqlQuery += ` AND ?? = ?`;
      queryParams.push("role_id", usertypeMap[usertype]);
    }

    const result = await mySqlQuery(sqlQuery, queryParams);
    return {
      result,
    };
  };

  updateUserData = async (user_id, userDetails) => {
    let {
      password,
      name,
      age,
      country_code,
      phone,
      dob,
      experties,
      experience,
      linked_in_link,
      twitter_link,
      instagram_link,
      about,
    } = userDetails;

    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push("?? = ?");
      values.push("name", name);
    }

    if (age !== undefined) {
      fields.push("?? = ?");
      values.push("age", age);
    }

    if (password !== undefined) {
      password = await encryptString(password);
      fields.push("?? = ?");
      values.push("encryptedPassword", password);
    }

    if (country_code !== undefined) {
      fields.push("?? = ?");
      values.push("country_code", country_code);
    }

    if (phone !== undefined) {
      fields.push("?? = ?");
      values.push("phone", phone);
    }

    if (dob !== undefined) {
      fields.push("?? = ?");
      values.push("dob", dob.split("T")[0]);
    }

    const fieldsForMentor = [];
    const valuesForMentor = [];

    if (experties !== undefined) {
      fieldsForMentor.push("?? = ?");
      valuesForMentor.push("experties", experties);
    }

    if (experience !== undefined) {
      fieldsForMentor.push("?? = ?");
      valuesForMentor.push("experience", experience);
    }

    if (linked_in_link !== undefined) {
      fieldsForMentor.push("?? = ?");
      valuesForMentor.push("linked_in_link", linked_in_link);
    }

    if (twitter_link !== undefined) {
      fieldsForMentor.push("?? = ?");
      valuesForMentor.push("twitter_link", twitter_link);
    }

    if (instagram_link !== undefined) {
      fieldsForMentor.push("?? = ?");
      valuesForMentor.push("instagram_link", instagram_link);
    }

    if (about !== undefined) {
      fieldsForMentor.push("?? = ?");
      valuesForMentor.push("about", about);
    }

    if (fieldsForMentor.length == 0 && fields.length == 0)
      return "No fields to update";

    let data;

    if (fieldsForMentor.length != 0) {
      const sqlQuery = `UPDATE mentors SET ${fieldsForMentor.join(
        ", ",
      )} WHERE user_id = ?`;
      valuesForMentor.push(user_id);

      data = await mySqlQuery(sqlQuery, valuesForMentor);
    }

    if (fields.length != 0) {
      const sqlQuery = `UPDATE users SET ${fields.join(
        ", ",
      )} WHERE user_id = ?`;
      values.push(user_id);

      data = await mySqlQuery(sqlQuery, values);
    }

    if (data.affectedRows > 0) {
      const users = await mySqlQuery("SELECT ?? FROM ?? WHERE ?? = ?", [
        "email",
        "users",
        "user_id",
        user_id,
      ]);
      await EmailService.sendEmail({
        to: users[0].email,
        subject: "UPDATE: You information changed",
        html: emailTemplate.accountDetailsUpdate(),
      });
      return "User data updated successfully";
    }

    return "No changes made to user data";
  };

  changeUserFromStudentToMentor = async (user_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "users",
      "role_id",
      2,
      "user_id",
      user_id,
    ]);

    if (data.affectedRows > 0) {
      const users = await mySqlQuery("SELECT ?? FROM ?? WHERE ?? = ?", [
        "email",
        "users",
        "user_id",
        user_id,
      ]);
      await EmailService.sendEmail({
        to: users[0].email,
        subject: "UPDATE: Admin made you a mentor",
        html: emailTemplate.promotionToMentor(),
      });
      return "User converted to mentor successfully";
    }
    return "No changes made to user";
  };

  deleteUser = async (user_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "users",
      "is_delete",
      1,
      "user_id",
      user_id,
    ]);

    if (data.affectedRows > 0) {
      const users = await mySqlQuery("SELECT ?? FROM ?? WHERE ?? = ?", [
        "email",
        "users",
        "user_id",
        user_id,
      ]);
      await EmailService.sendEmail({
        to: users[0].email,
        subject: "UPDATE: You Account deleted",
        html: emailTemplate.accountDeletion(),
      });
      return "User deleted successfully";
    }
    return "No changes made to user";
  };

  restoreUserAccount = async (user_id) => {
    const sqlQuery = `UPDATE ?? SET ?? = ? WHERE ?? =?`;
    const data = await mySqlQuery(sqlQuery, [
      "users",
      "is_delete",
      0,
      "user_id",
      user_id,
    ]);

    if (data.affectedRows > 0) {
      const users = await mySqlQuery("SELECT ?? FROM ?? WHERE ?? = ?", [
        "email",
        "users",
        "user_id",
        user_id,
      ]);
      await EmailService.sendEmail({
        to: users[0].email,
        subject: "UPDATE: You Account Restored by admin",
        html: emailTemplate.accountRestore(),
      });
      return "User restored successfully";
    }
    return "No changes made to user";
  };
}

export default UserService;
