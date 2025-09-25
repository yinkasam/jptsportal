// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA0FjcKs1tT8-jSRvxoBgbZ2wOcH6NBuCg",
  authDomain: "jpts-live-portal.firebaseapp.com",
  projectId: "jpts-live-portal",
  storageBucket: "jpts-live-portal.firebasestorage.app",
  messagingSenderId: "15318227613",
  appId: "1:15318227613:web:fd4904436dde1576ef1274",
  measurementId: "G-55K8FP55VT"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
