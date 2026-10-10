import { Router } from "express";
import {
  getShowForm,
  addShow,
  getShows,
} from "../controllers/showsController.js";

const showsApp = Router();

showsApp.get("/add_show", getShowForm);
showsApp.post("/add_show", addShow);
showsApp.get("/shows", getShows);

export default showsApp;
