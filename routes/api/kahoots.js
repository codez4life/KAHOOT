const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Load Input Validation
const validateKahootInput = require("../../validation/kahoot");
const validateQuestionInput = require("../../validation/question");
const validateAnswerInput = require("../../validation/answer");

//Load auth
const { ensureAuthenticated } = require("../../authentication/auth");

// Load Kahoot Model
const Kahoot = require("../../models/Kahoot");

// Load User Model
const User = require("../../models/User");

// @route   GET api/kahoots/test
// @desc    Tests users route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "kahoots Works" }));

// @route   GET api/kahoots
// @desc    Load all kahoots created by user
// @access  Private
router.get("/", ensureAuthenticated, (req, res) => {
  Kahoot.find({ user: req.user.id })
    .sort({ date: -1 })
    .then(kahoots => res.render("kahoots/index", { kahoots: kahoots }));
});

// @route   GET api/kahoots/proceed/:id
// @desc   Proceed to add questions
// @access  Private
router.get("/proceed/:id", ensureAuthenticated, (req, res) =>
  Kahoot.findById({ _id: req.params.id }).then(kahoot => {
    res.render("kahoots/proceed", { kahoot: kahoot });
  })
);

// @route   GET api/kahoots/addkahoot
// @desc    New Kahoot Form
// @access  Private
router.get("/addkahoot", ensureAuthenticated, (req, res) => {
  res.render("kahoots/addKahootForm");
});

// @route   POST api/kahoots/addkahoot
// @desc    Create a kahoot
// @access  Private
router.post("/addkahoot", ensureAuthenticated, (req, res) => {
  const { errors, isValid } = validateKahootInput(req.body);
  if (!isValid) {
    //Return any errors with 400 status
    return res.status(400).render("kahoots/addKahoot", {
      errors: errors,
      title: req.body.tilte,
      description: req.body.description
    });
  }
  const newkahoot = new Kahoot({
    user: req.user.id,
    title: req.body.title,
    description: req.body.description
  });
  newkahoot.save().then(kahoot => {
    req.flash("success_msg", "Kahoot successfully added");
    res.redirect(`/api/kahoots/proceed/${kahoot.id}`);
  });
});

// @route   GET api/kahoots/addquestion/:id
// @desc    Add Question Form for a Created kahoot
// @access  Private
router.get("/addquestion/:id", ensureAuthenticated, (req, res) => {
  Kahoot.findById({
    _id: req.params.id
  }).then(kahoot => {
    if (kahoot.user.toString() !== req.user.id) {
      req.flash("error_msg", "Not Authorized");
      res.redirect("/api/kahoots");
    } else {
      res.render("kahoots/addQuestionForm", { kahoot: kahoot });
    }
  });
});

// @route   POST api/kahoots/addquestion
// @desc    Add Questions to Kahoot
// @access  Private
router.post("/addquestion/:id", ensureAuthenticated, (req, res) => {
  const { errors, isValid } = validateQuestionInput(req.body);
  if (!isValid) {
    return res.status(400).render("kahoots/addQuestionForm", {
      errors: errors,
      ask: req.body.ask
    });
  }
  User.findOne({ user: req.user.id }).then(user => {
    Kahoot.findById({ _id: req.params.id })
      .then(kahoot => {
        //Check the owner of the kahoot
        if (kahoot.user.toString() !== req.user.id) {
          req.flash("error_msg", "Not Authorized");
        }
        //Add Questions  to the kahoot
        const newquestion = {
          ask: req.body.ask,
          _id: mongoose.Types.ObjectId()
        };
        //Add question to the array
        kahoot.questions.unshift(newquestion);

        //save
        kahoot.save().then(kahoot => {
          req.flash("success_msg", "Question successfully added to kahoot");
        });
        res.redirect(`/api/kahoots/addanswer/${kahoot._id}/${newquestion._id}`);
      })
      .catch(err => req.flash("error_msg", "No Kahoot found with that id"));
  });
});

// @route   GET api/kahoots/addanswer/:id/:question_id
// @desc    Add Question Form for a Created kahoot
// @access  Private
router.get("/addanswer/:id/:question_id", ensureAuthenticated, (req, res) => {
  Kahoot.findById(req.params.id).then(kahoot => {
    if (kahoot.user.toString() !== req.user.id) {
      req.flash("error_msg", "Not Authorized");
      res.redirect("/api/kahoots");
    } else {
      kahoot.questions.filter(question => {
        if (question.id.toString() === req.params.question_id) {
          res.render("kahoots/addAnswerForm", {
            kahoot: kahoot,
            question: question
          });
        } else {
          req.flash(
            "error_msg",
            "Sorry,the question to which you want to add an answer does not exist"
          );
        }
      });
    }
  });
});

// @route   POST api/kahoots/addanswers/:id/:question_id
// @desc    Attach Answers to A Kahoot Question
// @access  Private
router.post("/addanswer/:id/:question_id", ensureAuthenticated, (req, res) => {
  const { errors, isValid } = validateAnswerInput(req.body);
  if (!isValid) {
    return res.status(400).render("kahoots/addAnswersForm", {
      errors: errors,
      reply: req.body.reply
    });
  }
  User.findOne({ user: req.user.id }).then(user => {
    Kahoot.findById({ _id: req.params.id }).then(kahoot => {
      kahoot.questions.filter(question => {
        if (question._id.toString() === req.params.question_id) {
          const newanswer = {
            reply: req.body.reply,
            isCorrect: req.body.isCorrect
          };
          question.answers.unshift(newanswer);

          kahoot
            .save()
            .then(kahoot =>
              req.flash(
                "success_msg",
                "Answer option successfully added to kahoot Question"
              )
            );
          res.redirect(`/api/kahoots/addanswer/${kahoot.id}/${question.id}`);
        }
      });
    });
  });
});

// @route   GET api/kahoots/:id
// @desc    Get a kahoot by id
// @access  Private
router.get("/", (req, res) => {
  Kahoot.findById({ _id: req.params.id }).then(kahoot => {
    if (kahoot.user.toString() !== req.user.id) {
      res.status(401).json({ notauthorized: "You are not authorized" });
    } else {
      res.json(kahoot);
    }
  });
});

// @route   PUT api/kahoots/:id
// @desc    Edit a kahoot
// @access  Private

// @route   DELETE api/kahoots/:id
// @desc    Delete a kahoot
// @access  Private

//------END--OF--KAHOOT--ADMIN-----

//------START--OF--KAHOOT--CLIENTSIDE---

// @route   GET api/kahoots/play/:id
// @desc    Play a kahoot
// @access  Private
router.get("/play/:id", ensureAuthenticated, (req, res) => {
  Kahoot.findById({ _id: req.params.id }).then(kahoot => {
    res.render("kahoots/playkahoot");
  });
});

module.exports = router;
