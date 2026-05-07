// src/config/firebase.js


const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let messaging = null;
let initialized = false;

try {
  const renderSecretPath = '/etc/secrets/firebase-service-account.json';
  
  if (fs.existsSync(renderSecretPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(renderSecretPath, 'utf8'));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    messaging = admin.messaging();

    console.log('[FIREBASE DEBUG] Messaging object:', {
      type: typeof messaging,
      hasSendMulticast: typeof messaging?.sendMulticast,
      hasSendEach: typeof messaging?.sendEach,
      hasSend: typeof messaging?.send
    });



    initialized = true;
    console.log(' Firebase initialized from Render secret file');
  } 
  else {
    const localPath = path.join(__dirname, 'firebase-service-account.json');
    
    if (fs.existsSync(localPath)) {
      const serviceAccount = require('./firebase-service-account.json');
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      
      messaging = admin.messaging();
      initialized = true;
      console.log(' Firebase initialized from local file');
    } 
    else {
      console.warn(' Firebase service account not found. Push notifications disabled.');
      console.warn(' Add the file in Render: Settings → Secret Files → firebase-service-account.json');
    }
  }
} catch (error) {
  console.error(' Firebase initialization error:', error.message);
  console.warn(' Push notifications disabled, but server will continue running');
}

module.exports = { messaging, initialized };