const isEmpty = require("./is-empty");

module.exports = function validateQuestionInput(data) {
  let errors = {};

  data.ask = !isEmpty(data.ask)
    ? data.ask
    : (errors.ask = "Question field is required");

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
