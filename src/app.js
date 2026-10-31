import express from "express";
import process from "node:process";
import showsApp from "./routes/showsRouter.js";
import path from "node:path";
import { getErrorPage, errorPage } from "./controllers/showsController.js";
const PORT = process.env.PORT || 3000;
const app = express();

const assetPath = path.join(import.meta.dirname, "../public");
app.use(express.static(assetPath));
app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use("/", showsApp);
app.use(getErrorPage);
app.use(errorPage);

app.listen(PORT, () => {
  console.log(`Listening to PORT ${PORT}`); // eslint-disable-line no-console
});
