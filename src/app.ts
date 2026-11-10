import express from "express";
import {createUrl,decodeUrl} from "./createUrl/createUrl.controller.js"
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  return res.json({
    health: "ok",
  });
});

app.post("/create", createUrl);
app.post("/decode", decodeUrl);

app.use(errorMiddleware);

export default app;
