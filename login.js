// login.js
import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// Attach event to login button
document.querySelector(".SIGNIN-btn").addEventListener("click", async () => {
  const email = document.querySelector(".email").value;
  const password = document.querySelector(".password").value;

  try {
    // Firebase login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User:", userCredential.user);

    // Redirect to home
    window.location.href = "index.html";
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});