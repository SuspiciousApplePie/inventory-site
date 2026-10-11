import { Router } from "express";
import {
  getShowForm,
  addShow,
  getShows,
  getUpdateForm,
  updateShow,
} from "../controllers/showsController.js";

const showsApp = Router();

showsApp.get("/add_show", getShowForm);
showsApp.post("/add_show", addShow);
showsApp.get("/shows", getShows);
showsApp.get("/update_show/:animeId", getUpdateForm);
showsApp.post("/update_show/:animeId", updateShow);
export default showsApp;
