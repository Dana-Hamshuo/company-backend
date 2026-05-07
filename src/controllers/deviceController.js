// src/controllers/deviceController.js

const DeviceToken = require('../models/DeviceToken');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

exports.registerDevice = asyncHandler(async (req, res) => {
  const { token, deviceType, appVersion } = req.body;
  const userId = req.user._id;

  if (!token) {
    throw new AppError('Device token is required', 400, 'VALIDATION_ERROR', 'token');
  }

  // تسجيل أو تحديث التوكن
  const device = await DeviceToken.registerToken(
    userId, 
    token, 
    deviceType || 'android'
  );
  
  if (appVersion) {
    device.appVersion = appVersion;
    await device.save();
  }

  return success(res, { 
    message: 'Device registered successfully',
    deviceId: device._id 
  }, 'Device registered');
});

exports.unregisterDevice = asyncHandler(async (req, res) => {
  const { token } = req.body;  
  const userId = req.user._id;

  const query = { userId };
  if (token) query.token = token;

  await DeviceToken.deleteOne(query);

  return success(res, { message: 'Device unregistered successfully' });
});


exports.getUserDevices = asyncHandler(async (req, res) => {
  const devices = await DeviceToken.find({ userId: req.user._id })
    .select('deviceType appVersion lastUsed createdAt')
    .sort({ createdAt: -1 });

  return success(res, devices, 'User devices fetched');
});


exports.getAllDevices = asyncHandler(async (req, res) => {
  const devices = await DeviceToken.find({})
    .populate('userId', 'name email role')
    .select('userId token deviceType appVersion createdAt lastUsed')
    .sort({ createdAt: -1 })
    .lean();
  
  const sanitizedDevices = devices.map(device => ({
    id: device._id,
    userId: device.userId?._id,
    userName: device.userId?.name,
    userEmail: device.userId?.email,
    userRole: device.userId?.role,
    deviceType: device.deviceType,
    appVersion: device.appVersion,
    tokenPreview: device.token ? `${device.token.substring(0, 20)}...` : null,
    createdAt: device.createdAt,
    lastUsed: device.lastUsed
  }));

  return success(res, {
    count: sanitizedDevices.length,
    devices: sanitizedDevices
  }, 'All devices fetched');
});