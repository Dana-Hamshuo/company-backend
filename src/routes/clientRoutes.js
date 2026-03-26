const router = require("express").Router()

const clientController = require("../controllers/clientController")
const auth = require("../middlewares/authMiddleware")

router.post("/",auth,clientController.createClient)

router.get("/",auth,clientController.getClients)

router.delete("/:id",auth,clientController.deleteClient)

router.patch("/:id", auth, clientController.updateClient)

module.exports = router