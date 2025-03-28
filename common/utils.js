import connection from "../config/mysql.db.config.js";
import { saltRounds } from "./constants.js";
import bcrypt from "bcrypt";

export const buildResponse = (data, message, error = "") => {
  const response = {
    data,
    message,
    error,
  };

  return response;
};

export const encryptString = async (string) => {
  return await bcrypt.hash(string, saltRounds);
};

export const mySqlQuery = async (queryString, queryparams) =>
  new Promise(async (resolve, reject) => {
    connection.query(queryString, queryparams, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
