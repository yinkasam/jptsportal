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
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "LIVE.html";
  } else {
    // 🔥 On login, check if there's an active lecture
    const liveQuery = query(collection(db, "lectures"), where("status", "==", "live"));
    const liveSnap = await getDocs(liveQuery);

    if (!liveSnap.empty) {
      activeLectureId = liveSnap.docs[0].id;
      console.log("Active lecture found:", activeLectureId);
    }
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
    alert("No active lecture to end. Try refreshing the page.");
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

// ========== Download Attendance ==========
async function downloadAttendance() {
  if (!activeLectureId) {
    alert("No active lecture selected.");
    return;
  }

  try {
    // Query all attendance records for this lecture
    const q = query(
      collection(db, "attendance"),
      where("lectureId", "==", activeLectureId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert("No attendance records found for this lecture.");
      return;
    }

    // Prepare CSV rows
    let rows = [["User ID", "Lecture Title", "Lecture Code", "Timestamp"]];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      rows.push([
        data.userId,
        data.lectureTitle,
        data.lectureCode,
        data.timestamp?.toDate().toLocaleString() || "N/A"
      ]);
    });

    // Convert rows → CSV string
    let csvContent = rows.map(e => e.join(",")).join("\n");

    // Create downloadable blob
    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    let url = URL.createObjectURL(blob);

    // Trigger browser download
    let a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${activeLectureId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

  } catch (error) {
    console.error("Error downloading attendance:", error);
    alert("Failed to download attendance.");
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

// Expose functions to window
window.saveLecture = saveLecture;
window.endLecture = endLecture;
window.downloadAttendance = downloadAttendance;
window.logout = logout;
