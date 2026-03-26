const router = require("express").Router()

const authController = require("../controllers/authController")
const { body } = require("express-validator")

router.post("/login",  [
    body("email").isEmail(),
    body("password").notEmpty()
  ],validationMiddleware,authController.login)

module.exports = router