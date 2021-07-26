import firebaseAdmin from 'firebase-admin';

const serviceAccount = require('./config/ias-auth0-firebase-adminsdk-4n25a-7b0a3467bb.json');

// serviceAccount;
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  // databaseURL: 'https://ecommerce-225c8.firebaseio.com',
});

export default firebaseAdmin;
