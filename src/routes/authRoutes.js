
const router = require("express").Router()
const { loginValidation } = require("../validators/auth/login.validation");
const validate = require("../middlewares/validationMiddleware")
const authController = require("../controllers/authController.js")
const protect = require("../middlewares/authMiddleware.js")
router.post(
  "/login",
  loginValidation,
  validate,
  authController.login
);

router.get("/me", protect, getMe);


module.exports = router