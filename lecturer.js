// lecturer.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Track active lecture
let activeLectureId = null;

// ========== Protect the page ==========
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "LIVE.html";
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
    // ✅ End any existing "live" lectures
    const liveQuery = query(collection(db, "lectures"), where("status", "==", "live"));
    const liveSnap = await getDocs(liveQuery);
    for (const l of liveSnap.docs) {
      await updateDoc(doc(db, "lectures", l.id), { status: "ended" });
    }

    // ✅ Add the new lecture as "live"
    const docRef = await addDoc(collection(db, "lectures"), {
      title,
      code,
      lecturer,
      link,
      status: "live",
      createdAt: serverTimestamp()
    });

    activeLectureId = docRef.id;
    alert("Lecture is now live! Students can view it on their portal.");
} catch (error) {
  console.error("Error saving lecture: ", error.message, error.code);
  alert("Failed to save lecture: " + error.message);
}
}

// ========== End current lecture ==========
async function endLecture() {
  if (!activeLectureId) {
    alert("No active lecture to end.");
    return;
  }

  try {
    // Ask for recording link
    const recordingLink = prompt("Enter recording link (YouTube/Facebook/etc.) or leave blank:");

    const updateData = { status: "ended" };
    if (recordingLink && recordingLink.trim() !== "") {
      updateData.recordingLink = recordingLink.trim();
    }

    await updateDoc(doc(db, "lectures", activeLectureId), updateData);

    alert("Lecture has ended and is now in Past Lectures.");
    activeLectureId = null;
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

// Expose functions
window.saveLecture = saveLecture;
window.endLecture = endLecture;
window.logout = logout;
