// auth.js
import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// === DOM Elements ===
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const formTitle = document.getElementById("formTitle");

// Toggle Forms
document.getElementById("showRegister").addEventListener("click", () => {
  loginForm.style.display = "none";
  registerForm.style.display = "block";
  formTitle.textContent = "Register";
});
document.getElementById("showLogin").addEventListener("click", () => {
  registerForm.style.display = "none";
  loginForm.style.display = "block";
  formTitle.textContent = "Login";
});

// === Register (Student or Lecturer) ===
document.getElementById("registerBtn").addEventListener("click", async () => {
  const name = document.getElementById("regName").value.trim();
  const matric = document.getElementById("regMatric").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const role = document.getElementById("regRole").value; // student or lecturer

  if (!name || !email || !password || !role) {
    alert("Please fill in all required fields!");
    return;
  }
  if (role === "student" && !matric) {
    alert("Matric number is required for students!");
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    // Save details in Firestore under "users"
    await setDoc(doc(db, "users", uid), {
      name,
      matric: role === "student" ? matric : null, // lecturers won't need matric
      email,
      role,
      createdAt: new Date()
    });

    alert("Registration successful! You can now log in.");
    registerForm.style.display = "none";
    loginForm.style.display = "block";
    formTitle.textContent = "Login";

  } catch (error) {
    console.error(error);
    alert("Registration failed: " + error.message);
  }
});

// === Login ===
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    alert("Please enter your email and password.");
    return;
  }

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    // Fetch role + extra details from Firestore
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();

      // Save to localStorage for later use
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("studentName", userData.name);
      localStorage.setItem("studentMatric", userData.matric || "");
      localStorage.setItem("role", userData.role);

      // Redirect based on role
      if (userData.role === "lecturer") {
        window.location.href = "lecturerpg.html";
      } else {
        window.location.href = "index.html";
      }
    } else {
      alert("No profile found. Please register first.");
    }

  } catch (error) {
    console.error(error);
    alert("Login failed: " + error.message);
  }
});

// === Logout ===
export async function logoutUser() {
  try {
    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "LIVE.html";
  } catch (error) {
    alert("Logout failed: " + error.message);
  }
}