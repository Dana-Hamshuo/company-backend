const express = require("express")
const dotenv = require("dotenv")

dotenv.config()

const app = express()


require("./events/taskEvents")
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const clientRoutes = require("./routes/clientRoutes")
const projectRoutes = require("./routes/projectRoutes")
const taskRoutes = require("./routes/taskRoutes")
const calendarRoutes = require("./routes/calendarRoutes")
const adminRoutes = require("./routes/adminRoutes")
const notificationRoutes = require("./routes/notificationRoutes")

app.use("/api/auth",authRoutes)
app.use("/api/users",userRoutes)
app.use("/api/clients",clientRoutes)
app.use("/api/projects",projectRoutes)
app.use("/api/tasks",taskRoutes)
app.use("/api/calendar",calendarRoutes)
app.use("/api/admin",adminRoutes)
app.use("/api/notifications", notificationRoutes)

app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
      error: {
        type: "ROUTE_ERROR",
        details: `${req.method} ${req.originalUrl} not found`
      }
    })
  })
const errorMiddleware = require("./middlewares/errorMiddleware")

app.use(errorMiddleware)

module.exports = app