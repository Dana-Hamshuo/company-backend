// src/scripts/migrateTaskStatus.js


const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
  console.log(` Loaded .env from: ${envPath}`);
}

const mongoose = require("mongoose");
const Task = require("../models/Task");

async function migrateTaskStatus() {
  console.log(" Starting task status migration...");

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
  
  if (!mongoUri) {
    console.error(" Error: MONGODB_URI not found in environment variables");
    console.error(" Please add this to your .env file:");
    console.error("   MONGODB_URI=mongodb://localhost:27017/taskdb");
    process.exit(1);
  }
  
  console.log(` Connecting to: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
  
  try {
    await mongoose.connect(mongoUri);
    console.log(" Connected to database");

    const inProgressResult = await Task.updateMany(
      { status: "in_progress" },
      { $set: { status: "pending" } }
    );
    console.log(` Updated ${inProgressResult.modifiedCount} tasks: in_progress → pending`);

    const delayedResult = await Task.updateMany(
      { status: "delayed" },
      { 
        $set: { 
          status: "blocked",
          delayReason: "Migrated from delayed status"
        } 
      }
    );
    console.log(` Updated ${delayedResult.modifiedCount} tasks: delayed → blocked`);

    const stats = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    console.log(" Final status distribution:", stats);

    console.log(" Migration completed successfully!");

  } catch (error) {
    console.error(" Migration failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log(" Database connection closed");
  }
}

migrateTaskStatus();