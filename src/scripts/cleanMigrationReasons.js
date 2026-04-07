// src/scripts/cleanMigrationReasons.js

require("dotenv").config()
const mongoose = require("mongoose")
const Task = require("../models/Task")

async function cleanMigrationReasons() {
  console.log(" Cleaning migration artifacts...")
  
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
    if (!mongoUri) {
      console.error(" MONGODB_URI not found");
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri)
    console.log(" Connected to database")

    const beforeStats = await Task.aggregate([
      { 
        $match: { delayReason: { $exists: true, $ne: null } } 
      },
      { 
        $group: { _id: "$delayReason", count: { $sum: 1 } } 
      }
    ])
    console.log(" Before cleanup:", beforeStats)

    const result = await Task.updateMany(
      { delayReason: "Migrated from delayed status" },
      { $set: { delayReason: null } }
    )

    console.log(` Cleaned ${result.modifiedCount} tasks`)

    const afterStats = await Task.aggregate([
      { 
        $match: { delayReason: { $exists: true, $ne: null } } 
      },
      { 
        $group: { _id: "$delayReason", count: { $sum: 1 } } 
      }
    ])
    console.log(" After cleanup:", afterStats)

    const samples = await Task.find(
      { status: "blocked" },
      "title delayReason",
      { limit: 10 }
    )
    console.log(" Sample blocked tasks:", samples.map(t => ({
      title: t.title,
      reason: t.delayReason || "(no reason)"
    })))

    console.log(" Cleanup completed successfully!")

  } catch (error) {
    console.error(" Failed:", error.message)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log(" Database connection closed")
  }
}

cleanMigrationReasons()