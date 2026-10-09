import { Router } from "express";

const indexApp = Router();

indexApp.get("/", (req, res) => {
  res.render("index", {});
});

export default indexApp;
