import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const MYSQLHOST = process.env.MYSQLHOST;
const MYSQLUSER = process.env.MYSQLUSER;
const MYSQLPASSWORD = process.env.MYSQLPASSWORD;
const MYSQLDB = process.env.MYSQLDB;

const connection = mysql.createPool({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASSWORD,
  database: MYSQLDB,
});

export default connection;
