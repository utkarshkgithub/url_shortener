import express from "express";
import {createUrl,decodeUrl} from "./createUrl/createUrl.controller.js"

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  return res.json({
    health: "ok",
  });
});

app.post("/create", createUrl);
app.post("/decode", decodeUrl);

export default app;
