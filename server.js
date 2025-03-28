import "reflect-metadata";

import { expressjwt } from "express-jwt";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import errorMiddleware from "./middlewares/error.middleware.js";
import { jwtCookieName } from "./common/constants.js";
import { buildResponse } from "./common/utils.js";
import logger from "./common/logger.js";

import router from "./routes/router.js";

morgan.token("host", function (req, _res) {
  return req.hostname;
});

const app = express();

app.use(cookieParser());

app.use(
  morgan(
    ":date[web] :method :host :url :status :res[content-length] - :response-time ms",
    {
      skip: function (req, _res) {
        return req.url === "/";
      },
    },
  ),
);

app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ type: "application/json" }));
app.use(
  expressjwt({
    secret: process.env.JWT_SECRET,
    getToken: (req) => {
      if (req.cookies?.[jwtCookieName]) return req.cookies[jwtCookieName];

      if (req.headers.authorization?.startsWith("Bearer")) {
        return req.headers.authorization.split("Bearer ")[1];
      }

      return req.headers?.authorization;
    },
    algorithms: ["HS256"],
    requestProperty: "auth",
  }).unless({
    path: [
      // mention path where you dont wanna check token in following format RegExp("/api/v1/user/auth"),
      RegExp("/api/v1/auth/login"),
      RegExp("/api/v1/auth/signup"),
      RegExp("/api/v1/auth/reset-password"),
    ],
  }),
);

app.use((err, _req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(403).send(buildResponse("", "invalid token", err));
  } else {
    next(err);
  }
});

const port = process.env.PORT || 80;

app.use("/api/v1", router);

app.use(errorMiddleware);

app.listen(port, async () => {
  logger.info("App Started on port", { port });

  try {
    console.log("Database connection successful...");
  } catch (error) {
    logger.error(error);
  }
});
