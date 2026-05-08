
const app = require("./app")
require("dotenv").config()



const connectDB = require("./config/db")

process.env.TZ = process.env.TIMEZONE || 'Asia/Damascus';

const { start } = require('./jobs/taskReminderJob');
start();

const startServer = async () => {
  try {
    await connectDB()

    const PORT = process.env.PORT || 5000 || 8080

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })

  } catch (err) {
    console.error("Failed to start server:", err.message)
    process.exit(1)
  }
}


startServer()