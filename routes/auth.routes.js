import express from "express";
import { body, validationResult } from "express-validator";
import { register, login } from "../controllers/auth.controller.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("email").isEmail(),
    body("role").notEmpty(),
    body("password").notEmpty(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
  register
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
  login
);

export default router;
