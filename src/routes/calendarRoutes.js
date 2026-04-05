const router = require("express").Router()

const calendarController = require("../controllers/calendarController")
const taskController = require("../controllers/taskController")
const auth = require("../middlewares/authMiddleware")

router.get("/month",auth,calendarController.getMonth)

router.get("/my", auth, calendarController.getMyCalendar)

router.get("/range", auth, taskController.getTasksByDateRange) 

module.exports = router