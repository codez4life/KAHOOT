const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.username = !isEmpty(data.username)
    ? data.username
    : (errors.username = "Username field is required");

  data.email = !isEmpty(data.email)
    ? data.email
    : (errors.email = "Email field is required");

  data.password = !isEmpty(data.password)
    ? data.password
    : (errors.password = "Password field is required");

  //Check length of password
  if (data.password.length < 4) {
    errors.password = "Password must be longer than 4 characters";
  } else {
    data.password = data.password;
  }

  //Check if password input are equal
  if (isEmpty(data.password2)) {
    errors.password2 = "Confirm Password field is required";
  } else if (data.password !== data.password2) {
    errors.password2 = "Passwords do not match";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
