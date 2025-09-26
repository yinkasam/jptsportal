// index.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, query, orderBy, limit, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Protect the page
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "LIVE.html";
    return;
  }

  // Fetch extra student info (name, matric) from Firestore
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    document.getElementById("studentName").textContent = data.name || user.email;
    document.getElementById("studentMatric").textContent = data.matric || "N/A";
  } else {
    document.getElementById("studentName").textContent = user.email;
    document.getElementById("studentMatric").textContent = "N/A";
  }
});

// === Fetch and display *latest* lecture ===
const lectureList = document.querySelector(".lecture-list");

// Query Firestore: only the most recent lecture
const latestQuery = query(
  collection(db, "lectures"),
  orderBy("createdAt", "desc"),
  limit(1)
);

onSnapshot(latestQuery, (snapshot) => {
  lectureList.innerHTML = ""; // Clear old

  if (snapshot.empty) {
    lectureList.innerHTML = "<p>No live lecture available at the moment.</p>";
    return;
  }

  snapshot.forEach((docSnap) => {
    const lecture = docSnap.data();
    lectureList.innerHTML += `
      <div class="lecture-card">
        <h3>${lecture.title} (${lecture.code})</h3>
        <p>Lecturer: ${lecture.lecturer}</p>
        <p><small>Posted: ${lecture.createdAt?.toDate().toLocaleString() || "N/A"}</small></p>
        <a href="studentpg.html?id=${docSnap.id}" class="join-btn">Join Lecture</a>
      </div>
    `;
  });
});
