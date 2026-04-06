const router = require("express").Router()
const validate = require("../middlewares/validationMiddleware")
const clientController = require("../controllers/clientController")
const auth = require("../middlewares/authMiddleware")
const { createClientValidation } = require("../validators/client/client.validation");

router.post(
  "/",
  auth,
  auth.authorizeScheduler,
  createClientValidation,
  validate,
  clientController.createClient
);

router.get("/",auth,clientController.getClients)

router.delete("/:id",auth,auth.authorizeScheduler,clientController.deleteClient)

router.patch("/:id", auth,auth.authorizeScheduler, clientController.updateClient)

module.exports = router