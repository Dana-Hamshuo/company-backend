const express = require("express")
const router = express.Router()

const notificationController = require("../controllers/notificationController")
const authMiddleware = require("../middlewares/authMiddleware")

// 📄 get my notifications
router.get(
  "/",
  authMiddleware,
  notificationController.getMyNotifications
)

// ✅ mark as read
router.patch(
  "/:id/read",
  authMiddleware,
  notificationController.markAsRead
)

module.exports = router