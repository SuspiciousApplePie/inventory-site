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
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode ? err.statusCode : 500;
  res.status(statusCode).render("404", {
    statusCode: statusCode,
    message: err.message || "Something went wrong.",
  });
});

app.listen(PORT, () => {
  console.log(`Listening to PORT ${PORT}`); // eslint-disable-line no-console
});
