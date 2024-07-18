const fireBasedmin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(__dirname, './firebase-service-account-file.json'), 'utf-8'));

const adminApp = fireBasedmin.initializeApp({
  credential: fireBasedmin.credential.cert(serviceAccount)
});

module.exports = adminApp;
