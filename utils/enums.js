const QUERY_RESULT = {
  SUCCESS: "success",
  FOUND_ONE: "found one",
  NOT_FOUND: "not found",
  FOUND_MANY: "found many",
  FAIL: "fail",
};

const LOGIN_RESULT = {
  SUCCESS: "success",
  EMAIL_NOT_FOUND: "Email not found",
  PASSWORD_WRONG: "Wrong password",
};

const REGISTER_RESULT = {
  SUCCESS: "success",
  EMAIL_EXIST: "Email already used",
};

module.exports = {
  QUERY_RESULT,
  LOGIN_RESULT,
  REGISTER_RESULT,
};
