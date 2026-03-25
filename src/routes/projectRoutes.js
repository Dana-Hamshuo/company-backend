const router = require("express").Router()

const projectController = require("../controllers/projectController")
const auth = require("../middlewares/authMiddleware")

router.post("/",auth,projectController.createProject)

router.get("/",auth,projectController.getProjects)

router.delete("/:id",auth,projectController.deleteProject)

module.exports = router