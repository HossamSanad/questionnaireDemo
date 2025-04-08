// Firebase configuration for GitHub Pages deployment
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// Replace these placeholder values with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAJ-7_SHb84TeuES1k3VVttSuUx4gbQeHA",
  authDomain: "avatar-exp.firebaseapp.com",
  projectId: "avatar-exp",
  storageBucket: "avatar-exp.firebasestorage.app",
  messagingSenderId: "425029896130",
  appId: "1:425029896130:web:0cba2a6e5c6799f8d4385b",
  measurementId: "G-4FMSYDYV62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };

// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAJ-7_SHb84TeuES1k3VVttSuUx4gbQeHA",
//   authDomain: "avatar-exp.firebaseapp.com",
//   projectId: "avatar-exp",
//   storageBucket: "avatar-exp.firebasestorage.app",
//   messagingSenderId: "425029896130",
//   appId: "1:425029896130:web:0cba2a6e5c6799f8d4385b",
//   measurementId: "G-4FMSYDYV62"
// };

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
