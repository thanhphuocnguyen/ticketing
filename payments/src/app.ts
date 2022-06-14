import "express-async-errors";
import express from "express";
import cookieSession from "cookie-session";
import { json } from "body-parser";
import {
  errorHandler,
  getCurrUser,
  NotFoundError,
} from "@commonticketservice/common";
import paymentRouter from "./routes";
const app = express();

app.set("trust proxy", true);

app.use(express.urlencoded({ extended: true }));

app.use(json());

app.use(
  cookieSession({
    secure: process.env.NODE_ENV !== "test",
    signed: false,
  })
);

app.use(getCurrUser);

app.use(paymentRouter);

app.all("*", async () => {
  throw new NotFoundError("Jwt secret");
});

app.use(errorHandler);

export default app;
