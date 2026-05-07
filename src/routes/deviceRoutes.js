// src/routes/deviceRoutes.js

const router = require('express').Router();
const auth = require("../middlewares/authMiddleware"); 
const authorizeScheduler = auth.authorizeScheduler; 
// const auth = require('../middlewares/authMiddleware');
const deviceController = require('../controllers/deviceController');


router.post('/register', auth, deviceController.registerDevice);

router.post('/unregister', auth, deviceController.unregisterDevice);

router.get('/my-devices', auth, deviceController.getUserDevices);

router.get('/admin/all-devices', auth, authorizeScheduler, deviceController.getAllDevices);
module.exports = router;