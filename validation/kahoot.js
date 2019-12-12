const isEmpty = require("./is-empty");

module.exports = function validateKahootInput(data) {
  let errors = {};

  data.title = !isEmpty(data.title)
    ? data.title
    : (errors.title = "Title field is required");

  data.description = !isEmpty(data.description)
    ? data.description
    : (errors.description = "Description field is required");

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
