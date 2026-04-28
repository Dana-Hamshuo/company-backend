// src/config/firebase.js


const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');


const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.warn(' Firebase service account not found. Push notifications disabled.');
    module.exports = { messaging: null, initialized: false };
  } else {
    const serviceAccount = require('./firebase-service-account.json');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log(' Firebase initialized successfully');
    module.exports = { 
      messaging: admin.messaging(), 
      initialized: true 
    };
  }