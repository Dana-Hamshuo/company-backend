const router = require("express").Router()
const validate = require("../middlewares/validationMiddleware")
const projectController = require("../controllers/projectController")
const auth = require("../middlewares/authMiddleware")
const { createProjectValidation } = require("../validators/project/project.validation");

router.post(
  "/",
  auth,
  createProjectValidation,
  validate,
  projectController.createProject
);
router.get("/",auth,projectController.getProjects)

router.delete("/:id",auth,auth.authorizeScheduler,projectController.deleteProject)

router.patch("/:id", auth,auth.authorizeScheduler, projectController.updateProject)

router.get("/:id",auth,projectController.getProjectById)

router.post(
  "/:id/complete",
  auth,
  auth.authorizeScheduler,
  projectController.completeProject
)

router.post(
  "/:id/pause",
  auth,
  auth.authorizeScheduler,
  projectController.pauseProject
)

router.post(
  "/:id/reactivate",
  auth,
  auth.authorizeScheduler,
  projectController.reactivateProject
)



module.exports = router