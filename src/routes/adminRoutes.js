const router = require("express").Router()

const adminController = require("../controllers/adminController")

router.delete("/reset",adminController.resetDatabase)

module.exports = router