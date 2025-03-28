import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import {
  userJwtTokenValidDays,
  userJwtTokenValidMinutesForResetPassword,
} from "../common/constants.js";
import {
  ResourceNotFoundError,
  ValidationFailedError,
} from "../common/errors.js";
import { encryptString, mySqlQuery } from "../common/utils.js";

class AuthService {
  login = async (loginData) => {
    const user = await mySqlQuery(
      "SELECT ??, ??, ??, ??, ??, ?? FROM ?? where ?? = ?",
      [
        "user_id",
        "encryptedPassword",
        "role_id",
        "name",
        "email",
        "profile_image",
        "users",
        "email",
        loginData.email,
      ],
    );

    if (user.length == 0) {
      throw new ResourceNotFoundError(`user not found`);
    }

    const isMatching = user[0].encryptedPassword
      ? await bcrypt.compare(loginData.password, user[0].encryptedPassword)
      : false;

    if (!isMatching) {
      throw new ValidationFailedError(`wrong password`);
    }

    const jwtToken = jwt.sign(
      {
        id: user[0].user_id,
        claim: ["ADMIN", "MENTOR", "STUDENT"][user[0].role_id - 1],
      },
      process.env.JWT_SECRET ?? "",
      { expiresIn: `${userJwtTokenValidDays}d` },
    );

    const newUserData = { ...user[0] };
    delete newUserData.encryptedPassword;
    delete newUserData.role_id;

    return { user: newUserData, jwtToken };
  };

  resetPassword = async (email) => {
    const user = await mySqlQuery("SELECT ?? FROM ?? where ?? = ?", [
      "user_id",
      "users",
      "email",
      email,
    ]);

    if (user.length == 0) {
      throw new ResourceNotFoundError(`user not found`);
    }

    const jwtToken = jwt.sign(
      {
        id: user[0].user_id,
      },
      process.env.JWT_SECRET ?? "",
      { expiresIn: `${userJwtTokenValidMinutesForResetPassword}m` },
    );

    console.log(jwtToken);

    return {
      message: "If Your account exist on backend then you will receive email",
      resetToken: jwtToken,
    };
  };

  updatePassword = async (user_id, password) => {
    const encryptedPassword = await encryptString(password);
    const user = await mySqlQuery("UPDATE ?? SET ?? = ? WHERE ?? = ?", [
      "users",
      "encryptedPassword",
      encryptedPassword,
      "user_id",
      user_id,
    ]);

    if (user.affectedRows == 0) {
      throw new ResourceNotFoundError(`user not found`);
    }

    return "User Password Updated successfully.";
  };

  signup = async (userData) => {
    const duplicateEmailUser = await mySqlQuery(
      "SELECT ? FROM ?? where ?? = ?",
      ["user_id", "users", "email", userData.email],
    );

    if (duplicateEmailUser.length > 0) {
      throw new ValidationFailedError(`user already exists`);
    }

    userData.password = await encryptString(userData.password);
    const newUserData = {
      email: userData.email,
      encryptedPassword: userData.password,

      name: userData.name,
      age: userData.age,
      dob: userData.dob.split("T")[0],
      country_code: userData.country_code,
      phone: userData.phone,

      profile_complete: 0,
      user_source: 4,
      role_id: userData.role_id,
      is_delete: 0,

      created_at: new Date(),
      updated_at: new Date(),
    };

    const user = await mySqlQuery("INSERT INTO ?? SET ?", [
      "users",
      newUserData,
    ]);

    if (userData.role_id == 2) {
      const newMentorData = {
        experties: userData.experties,
        experience: userData.experience,

        linked_in_link: userData.linked_in_link,
        twitter_link: userData.twitter_link,
        instagram_link: userData.instagram_link,
        about: userData.about,
        user_id: user.insertId,

        is_delete: 0,

        created_at: new Date(),
        updated_at: new Date(),
      };

      await mySqlQuery("INSERT INTO ?? SET ?", ["mentors", newMentorData]);
    }

    delete newUserData.encryptedPassword;

    const jwtToken = jwt.sign(
      {
        id: user.insertId,
      },
      process.env.JWT_SECRET ?? "",
      { expiresIn: `${userJwtTokenValidMinutesForResetPassword}m` },
    );

    newUserData.resetToken = jwtToken;

    return newUserData;
  };
}

export default AuthService;
