const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const passport = require("passport");

// Load Input Validation
const validateRegisterInput = require("../../validation/register");

// Load User model
const User = require("../../models/User");

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Users Works" }));

// @route   GET api/users/register
// @desc    Get New User Registration Form
// @access  Public
router.get("/register", (req, res) => {
  res.render("users/register");
});

// @route   GET api/users/login
// @desc    Get User Login Form
// @access  Public
router.get("/login", (req, res) => {
  res.render("users/login");
});

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).render("users/register", {
      errors: errors,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    });
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      req.flash("error_msg", "Email already exists");
      res.redirect("/api/users/register");
    }
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      avatar,
      password: req.body.password
    });
    //Hash the password
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then(user => {
            req.flash("success_msg", "You are now registered and can log in");
            res.redirect("/api/users/login");
          })
          .catch(err => {
            console.log(err);
            0;
            return;
          });
      });
    });
  });
});

// @route POST api/users/login
// @desc  Login User with local
// @access  Public
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/api/kahoots",
    failureRedirect: "/api/users/login",
    failureFlash: true
  })(req, res, next);
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

//@route GET api/users/logout
//@desc    User logout route
//@access  Private
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/api/users/login");
});

module.exports = router;
