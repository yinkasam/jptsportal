// student.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  collection,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

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

      if (lecture.status === "live") {
        renderLecture(lecture, lectureId);
      } else if (lecture.recordingLink) {
        renderRecording(lecture);
      } else {
        titleEl.textContent = "This lecture has ended. Recording not available.";
      }
    } else {
      titleEl.textContent = "Lecture not found.";
    }
  } else {
    // Load latest live lecture
    const q = query(
      collection(db, "lectures"),
      where("status", "==", "live"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const lectureDoc = snapshot.docs[0];
        const lecture = lectureDoc.data();
        renderLecture(lecture, lectureDoc.id);
      } else {
        titleEl.textContent = "No live lecture available right now.";
      }
    });
  }
}

// === Render live lecture ===
function renderLecture(lecture, lectureId) {
  titleEl.textContent = `Now Streaming: ${lecture.title} (${lecture.code})`;
  detailsEl.textContent = `Lecturer: ${lecture.lecturer}`;
  frameEl.src = lecture.link;

  // Attendance increment
  markAttendance(lectureId, lecture);

  // Start chat for this lecture
  loadChat(lectureId);
}

// === Render recording for past lecture ===
function renderRecording(lecture) {
  titleEl.textContent = `Recording: ${lecture.title} (${lecture.code})`;
  detailsEl.textContent = `Lecturer: ${lecture.lecturer}`;
  frameEl.src = lecture.recordingLink;
}

// === Attendance ===
async function markAttendance(lectureId, lecture) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    // Check if attendance already exists
    const q = query(
      collection(db, "attendance"),
      where("userId", "==", user.uid),
      where("lectureId", "==", lectureId)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      // First time joining → save attendance
      await addDoc(collection(db, "attendance"), {
        userId: user.uid,
        lectureId,
        lectureTitle: lecture.title,
        lectureCode: lecture.code,
        timestamp: serverTimestamp(),
      });
    }

    // Update attendance counter
    updateCounter(user.uid);
  } catch (error) {
    console.error("Error marking attendance:", error);
  }
}

function updateCounter(userId) {
  const q = query(collection(db, "attendance"), where("userId", "==", userId));
  onSnapshot(q, (snapshot) => {
    counterEl.textContent = `Lectures Attended: ${snapshot.size}`;
  });
}

// === CHAT FEATURE ===
const chatMessagesEl = document.getElementById("chatMessages");
const chatInputEl = document.getElementById("chatMessage");

function loadChat(lectureId) {
  const q = query(
    collection(db, "chats"),
    where("lectureId", "==", lectureId),
    orderBy("timestamp", "asc")
  );

  onSnapshot(q, (snapshot) => {
    chatMessagesEl.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const chat = docSnap.data();
      const msg = document.createElement("p");
      msg.innerHTML = `<strong>${chat.name}:</strong> ${chat.message}`;
      chatMessagesEl.appendChild(msg);
    });

    // Auto-scroll to bottom
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  });
}

window.sendMessage = async function () {
  const user = auth.currentUser;
  if (!user) return;
  const message = chatInputEl.value.trim();
  if (!message) return;

  // Get user name from Firestore (or fallback to email)
  let name = user.email;
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    name = userDoc.data().name || user.email;
  }

  await addDoc(collection(db, "chats"), {
    userId: user.uid,
    name,
    lectureId: lectureId || "general",
    message,
    timestamp: serverTimestamp()
  });

  chatInputEl.value = ""; // clear input
};

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
