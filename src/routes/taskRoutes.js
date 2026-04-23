const router = require("express").Router()

const taskController = require("../controllers/taskController")
const auth = require("../middlewares/authMiddleware"); 
const authorizeScheduler = auth.authorizeScheduler; 
const { createTaskValidation } = require("../validators/task/createTask.validation");
const validate = require("../middlewares/validationMiddleware");

router.get("/month", auth, taskController.getTasksByMonth)              
router.get("/range", auth, taskController.getTasksByDateRange)        
router.get("/user/:userId", auth, taskController.getTasksByUser)        
router.get("/my/pending-count", auth, taskController.getMyPendingTasksCount)

router.get("/", auth, taskController.getAllTasks)                  

router.get("/:id", auth, taskController.getTaskSchedule)             
router.patch("/:id", auth, authorizeScheduler, taskController.updateTask)
router.post("/:id/complete", auth, authorizeScheduler, taskController.completeTask)
router.post("/:id/delay", auth, authorizeScheduler, taskController.delayTask)
router.delete("/:id", auth, authorizeScheduler, taskController.deleteTask)

router.post(
    "/",
    auth, 
    authorizeScheduler,                              
    ...createTaskValidation,
    validate,
    taskController.createTask
);
module.exports = router