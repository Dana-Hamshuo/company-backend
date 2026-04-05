
const router = require("express").Router()
const { loginValidation } = require("../validators/auth/login.validation");
const validate = require("../middlewares/validationMiddleware")
const authController = require("../controllers/authController.js")
const auth = require("../middlewares/authMiddleware"); 
router.post(
  "/login",
  loginValidation,
  validate,
  authController.login
);

router.get("/me", auth, authController.getMe);


module.exports = router