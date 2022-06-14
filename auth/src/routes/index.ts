import { Password } from "./../services/password";
import express, { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import {
  BadRequestError,
  getCurrUser,
  validateRequestcheck,
} from "@commonticketservice/common";

const routerAuth = express.Router();

routerAuth.get(
  "/api/users/currentUser",
  getCurrUser,
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).send({ currentUser: req.currentUser });
  }
);

routerAuth.post(
  "/api/users/sign-in",
  [
    body("email")
      .isEmail()
      .withMessage("Email must be valid")
      .custom(async (value, { req: Request }) => {
        const existedUser = await User.findOne({ email: value });
        if (!existedUser) {
          return Promise.reject("User is not existed");
        }
      }),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password must not be empty"),
  ],
  validateRequestcheck,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const checkPassword = await Password.compare(user!.password, password);
    if (!checkPassword) {
      throw new BadRequestError("Invalid credentials");
    }
    const jwtUser = await jwt.sign(
      { id: user!.id, email: user!.email },
      process.env.JWT_KEY!
    );
    req.session = {
      jwt: jwtUser,
    };
    res.status(200).send(user);
  }
);

routerAuth.post(
  "/api/users/sign-up",
  [
    body("email")
      .custom(async (value, { req: Request }) => {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject("E-mail address already exitst");
        }
      })
      .normalizeEmail()
      .isEmail()
      .withMessage("Email is invalid")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("beetween 4 to 20 characters"),
    body("password")
      .isStrongPassword()
      .withMessage("Password very week")
      .notEmpty()
      .withMessage("password is required"),
  ],
  validateRequestcheck,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    // throw new DatabaseConnectionError();
    const user = User.build({ email, password });
    await user.save();
    const jwtUser = await jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_KEY!
    );
    req.session = {
      jwt: jwtUser,
    };
    res.status(201).send(user);
  }
);

routerAuth.post("/api/users/sign-out", (req, res, next) => {
  req.session = null;
  res.send({});
});

export default routerAuth;
