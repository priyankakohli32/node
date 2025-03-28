import dotenv from "dotenv";
dotenv.config();

export const saltRounds = 10;
export const defaultPageNumber = 0;
export const defaultPageSize = 10;
export const userJwtTokenValidDays = 7;
export const userJwtTokenValidMinutesForResetPassword = 15;
export const jwtCookieName = "jwtToken";

export const FRONTEND_WEB_URL = process.env.FRONTEND_WEB_URL;

export const userRole = {
  SUPERADMIN: 1,
  ADMIN: 2,
  MENTOR: 3,
  STUDENTS: 4,
};

export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};
