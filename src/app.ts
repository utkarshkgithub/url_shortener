import express from "express";
import { createUrl } from "./createUrl/createUrl.controller.js";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { decodeUrl } from "./decodeUrl/decodeUrl.controller.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import authRouter from "./auth/auth.router.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  return res.json({
    health: "ok",
  });
});

//TODO: add auth middleware
app.use("/u/auth", authRouter);
app.post("/u/create", authMiddleware, createUrl);
app.get("/:shortCode", decodeUrl);

app.use(errorMiddleware);

export default app;
