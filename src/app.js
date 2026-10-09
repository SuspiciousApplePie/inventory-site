import express from "express";
import process from "node:process";
import indexApp from "./routes/indexRouter.js";
import showsApp from "./routes/showsRouter.js";
import path from "node:path";
const PORT = process.env.PORT || 3000;
const app = express();

app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use("/", indexApp);
app.use("/", showsApp);

app.listen(PORT, () => {
  console.log(`Listening to PORT ${PORT}`); // eslint-disable-line no-console
});
