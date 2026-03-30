const { loginValidation } = require("../validators/auth/login.validation");
const validate = require("../middlewares/validationMiddleware");
const router = require("express").Router()
router.post(
  "/login",
  loginValidation,
  validate,
  authController.login
);