// src/scripts/migrateTaskStatus.js - النسخة المحسّنة

require("dotenv").config()
const mongoose = require("mongoose")
const Task = require("../models/Task")

async function migrateTaskStatus() {
  console.log(" Starting task status migration (preserving delayReason)...")
  
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
    if (!mongoUri) {
      console.error(" MONGODB_URI not found");
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri)
    console.log(" Connected to database")

    const inProgressResult = await Task.updateMany(
      { status: "in_progress" },
      { $set: { status: "pending" } }
    )
    console.log(` Updated ${inProgressResult.modifiedCount} tasks: in_progress → pending`)

    const delayedResult = await Task.updateMany(
      { 
        status: "delayed",
        delayReason: { $exists: false }
      },
      { 
        $set: { 
          status: "blocked",
          delayReason: null  
        } 
      }
    )
    console.log(` Updated ${delayedResult.modifiedCount} tasks: delayed → blocked (no reason)`)

    const delayedWithReason = await Task.updateMany(
      { 
        status: "delayed",
        delayReason: { $exists: true, $ne: null }
      },
      { 
        $set: { status: "blocked" }
      }
    )
    console.log(` Preserved delayReason for ${delayedWithReason.modifiedCount} tasks`)

    const stats = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ])
    console.log(" Final status distribution:", stats)

    const samples = await Task.find(
      { status: "blocked", delayReason: { $exists: true, $ne: null } },
      "title delayReason",
      { limit: 5 }
    )
    console.log(" Sample blocked tasks with reasons:", samples.map(t => ({
      title: t.title,
      reason: t.delayReason
    })))

    console.log(" Migration completed successfully!")

  } catch (error) {
    console.error(" Migration failed:", error.message)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log(" Database connection closed")
  }
}

migrateTaskStatus()