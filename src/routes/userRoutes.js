const router = require("express").Router()

const userController = require("../controllers/userController")
const auth = require("../middlewares/authMiddleware")

router.post("/",userController.createUser)

router.get("/",auth,userController.getUsers)

router.patch("/:id", auth,userController.updateUser)

router.delete("/:id",auth,userController.deleteUser)

module.exports = router