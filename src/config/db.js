//src/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI,{
      retryWrites: true,
      w: "majority" 
    });
    console.log("MongoDb Connected");
  } catch (err) {
    console.error("MongoDB Error", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
