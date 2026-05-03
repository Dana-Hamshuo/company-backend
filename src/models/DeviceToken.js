// src/models/DeviceToken.js

const mongoose = require('mongoose');

const deviceTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  deviceType: {
    type: String,
    enum: ['ios', 'android', 'web'],
    default: 'android'
  },
  
  appVersion: String, 
  
  lastUsed: {
    type: Date,
    default: Date.now
  }
  
}, { timestamps: true });

deviceTokenSchema.index({ userId: 1, deviceType: 1 });

// deviceTokenSchema.statics.registerToken = async function(userId, token, deviceType) {
//   await this.findOneAndDelete({ userId, deviceType });
  
//   return this.create({ userId, token, deviceType });
// };
// src/models/DeviceToken.js

deviceTokenSchema.statics.registerToken = async function (userId, token, deviceType) {
  return await this.findOneAndUpdate(
    { token }, 
    {
      userId,
      token,
      deviceType: deviceType || 'android',
      lastUsed: new Date() 
    },
    {
      new: true,            
      upsert: true,           
      setDefaultsOnInsert: true 
    }
  );
};

module.exports = mongoose.model('DeviceToken', deviceTokenSchema);