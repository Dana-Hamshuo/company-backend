const router = require("express").Router()

const taskController = require("../controllers/taskController")

const auth = require("../middlewares/authMiddleware")

const { createTaskValidation } = require("../validators/task/createTask.validation");
const validate = require("../middlewares/validationMiddleware");

router.post(
    "/",
    auth,
    createTaskValidation,
    validate,
    taskController.createTask
  );

router.post("/:id/delay",auth,taskController.delayTask)

router.get("/",auth,taskController.getAllTasks)

router.get("/user/:userId", auth, taskController.getTasksByUser)

router.get("/range", auth, taskController.getTasksByDateRange)

router.get("/:id", auth, taskController.getTaskSchedule)

router.patch( "/:id",auth,taskController.updateTask)

router.post("/:id/complete",auth,taskController.completeTask)

router.delete("/:id",auth,taskController.deleteTask)

module.exports = router