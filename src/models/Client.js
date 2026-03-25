// models/Client.js

const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
    name: String,
    businessType: String,
    notes: String
  }, { timestamps: true });
  
  module.exports = mongoose.model("Client", clientSchema);