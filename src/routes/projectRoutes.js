const router = require("express").Router()

const projectController = require("../controllers/projectController")
const auth = require("../middlewares/authMiddleware")

router.post("/",auth,projectController.createProject)

router.get("/",auth,projectController.getProjects)

router.delete("/:id",auth,projectController.deleteProject)

router.patch("/:id", auth, projectController.updateProject)

router.get("/:id",auth,projectController.getProjectById)
module.exports = router