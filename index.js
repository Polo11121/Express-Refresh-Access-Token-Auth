require("dotenv").config();
const express = require("express");
const serverless = require("serverless-http"); // Wymagane do uruchomienia na Vercel
const path = require("path");
const cors = require("cors");
const corsOptions = require("../config/corsOptions");
const { logger } = require("../middleware/logEvents");
const errorHandler = require("../middleware/errorHandler");
const verifyJWT = require("../middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("../middleware/credentials");
const mongoose = require("mongoose");
const connectDB = require("../config/dbConn");

// Połącz z MongoDB
connectDB();

// Inicjalizacja aplikacji Express
const app = express();

// custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

// middleware for cookies
app.use(cookieParser());

// Serve static files
app.use("/", express.static(path.join(__dirname, "../public")));

// routes
app.use("/", require("../routes/root"));
app.use("/register", require("../routes/register"));
app.use("/auth", require("../routes/auth"));
app.use("/refresh", require("../routes/refresh"));
app.use("/logout", require("../routes/logout"));

app.use(verifyJWT);
app.use("/employees", require("../routes/api/employees"));
app.use("/users", require("../routes/api/users"));

// Handle 404 errors
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "../views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// Custom error handler middleware
app.use(errorHandler);

// Eksport aplikacji jako funkcji serverless
module.exports = serverless(app);
