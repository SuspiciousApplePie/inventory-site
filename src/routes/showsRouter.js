import { Router } from "express";
import { getShowForm, addShow } from "../controllers/showsController.js";

const showsApp = Router();

showsApp.get("/add_show", getShowForm);
showsApp.post("/add_show", addShow);

export default showsApp;
