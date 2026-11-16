import { Router } from "express";
import * as authController from "./auth.controller.js";
const authRouter = Router();

authRouter.post("/login", authController.login);
authRouter.post("/signup", authController.signup);
authRouter.post("/logout", authController.logout);

export default authRouter;
