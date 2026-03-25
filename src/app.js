const express = require("express")
const dotenv = require("dotenv")

dotenv.config()

const app = express()

app.use(express.json())
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

const errorMiddleware = require("./middlewares/errorMiddleware")

app.use(errorMiddleware)

module.exports = app