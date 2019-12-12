const isEmpty = require("./is-empty");

module.exports = function validateAnswerInput(data) {
  let errors = {};

  data.reply = !isEmpty(data.reply)
    ? data.reply
    : (errors.reply = "Answer field is required");

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
