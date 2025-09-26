import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, query, orderBy, limit, doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Protect the page
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "LIVE.html";
  }
});

// === Get lecture ID from URL ===
const params = new URLSearchParams(window.location.search);
const lectureId = params.get("id");

// DOM Elements
const titleEl = document.getElementById("courseTitle");
const detailsEl = document.getElementById("courseDetails");
const frameEl = document.getElementById("streamFrame");
const counterEl = document.getElementById("studentCounter");

// === Fetch specific or latest lecture ===
async function loadLecture() {
  if (lectureId) {
    // Load specific lecture by ID
    const docRef = doc(db, "lectures", lectureId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const lecture = docSnap.data();
      renderLecture(lecture);
    } else {
      titleEl.textContent = "Lecture not found.";
    }
  } else {
    // Load latest lecture (live)
    const q = query(collection(db, "lectures"), orderBy("createdAt", "desc"), limit(1));
    onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const lecture = snapshot.docs[0].data();
        renderLecture(lecture);
      } else {
        titleEl.textContent = "No live lecture available right now.";
      }
    });
  }
}

// === Render lecture to DOM ===
function renderLecture(lecture) {
  titleEl.textContent = `Now Streaming: ${lecture.title} (${lecture.code})`;
  detailsEl.textContent = `Lecturer: ${lecture.lecturer}`;
  frameEl.src = lecture.link;

  // Attendance increment
  markAttendance();
}

// === Attendance ===
function markAttendance() {
  const user = auth.currentUser;
  if (!user) return;

  const matric = localStorage.getItem("studentMatric") || user.uid;

  let count = parseInt(localStorage.getItem(matric + "_attendance")) || 0;
  if (!sessionStorage.getItem("attendanceMarked")) {
    count++;
    localStorage.setItem(matric + "_attendance", count);
    sessionStorage.setItem("attendanceMarked", "true");
  }

  updateCounter(matric);
}

function updateCounter(matric) {
  let count = parseInt(localStorage.getItem(matric + "_attendance")) || 0;
  counterEl.textContent = `Lectures Attended: ${count}`;
}

// === Logout ===
window.logout = function () {
  signOut(auth).then(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "LIVE.html";
  });
};

// Init
loadLecture();
