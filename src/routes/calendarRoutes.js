const router = require("express").Router()

const calendarController = require("../controllers/calendarController")

const auth = require("../middlewares/authMiddleware")

router.get("/month",auth,calendarController.getMonth)

router.get("/my", auth, calendarController.getMyCalendar)

module.exports = router