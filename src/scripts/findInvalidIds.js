// src/scripts/findInvalidIds.js

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
  console.log(`✅ Loaded .env from: ${envPath}`);
}

const mongoose = require("mongoose")
const Task = require("../models/Task")

async function findInvalidIds() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
    
    if (!mongoUri) {
      console.error(" Error: MONGODB_URI not found in environment variables");
      console.error(" Please add this to your .env file:");
      console.error("   MONGODB_URI=mongodb://localhost:27017/taskdb");
      process.exit(1);
    }
    
    console.log(` Connecting to: ${mongoUri.replace(/\/\/[^:]+:[^@]+/, '//***:***@')}`);
    
    await mongoose.connect(mongoUri)
    console.log(" Connected to database")

    const tasks = await Task.find({});
    
    console.log(` Total tasks: ${tasks.length}`)
    
    let invalidCount = 0;
    
    for (const task of tasks) {
      let hasInvalid = false;
      
      if (!task.projectId || !mongoose.Types.ObjectId.isValid(task.projectId)) {
        console.log(` Task ${task._id}: Invalid projectId: ${task.projectId}`)
        hasInvalid = true;
      }
      
      if (task.assignedUsers && task.assignedUsers.length > 0) {
        for (const user of task.assignedUsers) {
          if (!user.userId || !mongoose.Types.ObjectId.isValid(user.userId)) {
            console.log(` Task ${task._id}: Invalid userId: ${user.userId}`)
            hasInvalid = true;
          }
        }
      }
      
      if (hasInvalid) invalidCount++;
    }
    
    console.log(`\n Tasks with invalid IDs: ${invalidCount}`)

  } catch (error) {
    console.error(" Failed:", error.message)
  } finally {
    await mongoose.connection.close()
    console.log(" Database connection closed")
  }
}

findInvalidIds()