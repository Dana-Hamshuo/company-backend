const router = require("express").Router()

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

router.delete("/:id",auth,projectController.deleteProject)

router.patch("/:id", auth, projectController.updateProject)

router.get("/:id",auth,projectController.getProjectById)
module.exports = router