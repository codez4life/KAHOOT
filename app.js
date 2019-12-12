const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const passport = require("passport");

//Load All Routes
const users = require("./routes/api/users");
const kahoots = require("./routes/api/kahoots");

//Passport Authentication
require("./authentication/passport")(passport);

const app = express();

//DB Config

//Connect mongoose to mongodb
mongoose
  .connect("mongodb://localhost/kahoot-dev", {
    useNewUrlParser: true
  })
  .then(() => console.log("MongoDB connected successfully..."))
  .catch(err => console.log(err));

// Handlebars Middleware
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Body parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Method override Middleware
app.use(methodOverride("_method"));

// Express session Middleware
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Flash Middleware
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

//Use Routes
app.use("/api/users", users);
app.use("/api/kahoots", kahoots);

//Basic Index Route
app.get("/", (req, res) => {
  res.render("index");
});

//Static folder
app.use(express.static(path.join(__dirname, "public")));

//Server Port Configuration
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
