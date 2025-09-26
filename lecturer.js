// lecturer.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Track the active lecture ID for the lecturer
let activeLectureId = null;

// ========== Protect the page ==========
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "LIVE.html"; // Redirect to login if not authenticated
  }
});

// ========== Save a new lecture ==========
async function saveLecture() {
  const title = document.getElementById("courseTitle").value.trim();
  const code = document.getElementById("courseCode").value.trim();
  const lecturer = document.getElementById("lecturerName").value.trim();
  const link = document.getElementById("lectureLink").value.trim();

  if (!title || !code || !link) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    // Add lecture to Firestore with status = live
    const docRef = await addDoc(collection(db, "lectures"), {
      title,
      code,
      lecturer,
      link,
      status: "live", // ✅ mark as live
      createdAt: serverTimestamp()
    });

    activeLectureId = docRef.id; // Save current live lecture ID
    alert("Lecture is now live! Students can view it on their portal.");
  } catch (error) {
    console.error("Error saving lecture: ", error);
    alert("Failed to save lecture. Please try again.");
  }
}

// ========== End current lecture ==========
async function endLecture() {
  if (!activeLectureId) {
    alert("No active lecture to end.");
    return;
  }

  try {
    const docRef = doc(db, "lectures", activeLectureId);
    await updateDoc(docRef, { status: "ended" }); // ✅ mark as ended
    alert("Lecture has ended and is now in Past Lectures.");
    activeLectureId = null; // Reset
  } catch (error) {
    console.error("Error ending lecture: ", error);
    alert("Failed to end lecture. Please try again.");
  }
}

// ========== Logout ==========
function logout() {
  signOut(auth).then(() => {
    window.location.href = "LIVE.html";
  }).catch((error) => {
    console.error("Logout error: ", error);
  });
}

// Expose functions to HTML
window.saveLecture = saveLecture;
window.endLecture = endLecture; // ✅ expose endLecture
window.logout = logout;
