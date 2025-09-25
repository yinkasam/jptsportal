// student.js

import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Protect the page
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "LIVE.html";
  } else {
    // Track attendance once per session
    markAttendance(user);
  }
});

// Listen for latest lecture
const lecturesRef = collection(db, "lectures");
const q = query(lecturesRef, orderBy("createdAt", "desc"), limit(1));

onSnapshot(q, (snapshot) => {
  if (!snapshot.empty) {
    const lecture = snapshot.docs[0].data();
    document.getElementById("courseTitle").textContent =
      `Now Streaming: ${lecture.title} (${lecture.code})`;
    document.getElementById("courseDetails").textContent =
      `Lecturer: ${lecture.lecturer}`;
    document.getElementById("streamFrame").src = lecture.link;
  } else {
    document.getElementById("courseTitle").textContent =
      "No live lecture available right now.";
  }
});

// === Attendance Function ===
async function markAttendance(user) {
  const matric = localStorage.getItem("studentMatric");
  const name = localStorage.getItem("studentName");

  if (!matric || !name) return;

  const attendanceRef = doc(db, "attendance", user.uid);

  const snap = await getDoc(attendanceRef);

  if (!snap.exists()) {
    // First attendance
    await setDoc(attendanceRef, {
      name,
      matric,
      count: 1,
      lastAttended: serverTimestamp(),
    });
  } else {
    // Update existing record
    const current = snap.data().count || 0;
    await updateDoc(attendanceRef, {
      count: current + 1,
      lastAttended: serverTimestamp(),
    });
  }

  // Update UI counter
  const updatedSnap = await getDoc(attendanceRef);
  document.getElementById("studentCounter").textContent =
    `Lectures Attended: ${updatedSnap.data().count}`;
}

// Logout function
window.logout = async function () {
  await signOut(auth);
  localStorage.clear();
  window.location.href = "LIVE.html";
};
