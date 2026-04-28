// src/routes/deviceRoutes.js

const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const deviceController = require('../controllers/deviceController');

router.post('/register', auth, deviceController.registerDevice);

router.post('/unregister', auth, deviceController.unregisterDevice);

router.get('/my-devices', auth, deviceController.getUserDevices);

module.exports = router;