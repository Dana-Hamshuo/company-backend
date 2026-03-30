
const router = require("express").Router()
const { loginValidation } = require("../validators/auth/login.validation");
const validate = require("../middlewares/validationMiddleware")
router.post(
  "/login",
  loginValidation,
  validate,
  authController.login
);