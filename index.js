// index.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("studentName").textContent = user.email; 
    // Later: fetch extra info (matric, full name) from Firestore
  } else {
    window.location.href = "LIVE.html"; // Redirect to login
  }
});