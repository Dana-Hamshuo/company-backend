const router = require("express").Router()

const notificationController = require("../controllers/notificationController")
const authMiddleware = require("../middlewares/authMiddleware") 
router.get(
  "/",
  authMiddleware,
  notificationController.getMyNotifications
) 
router.patch(
  "/:id/read",
  authMiddleware,
  notificationController.markAsRead
);

module.exports = router;