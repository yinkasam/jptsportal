// past.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Protect the page
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "LIVE.html";
  }
});

// === Load all past lectures ===
const pastLectures = document.getElementById("pastLectures");

const q = query(collection(db, "lectures"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
  pastLectures.innerHTML = "";

  if (snapshot.empty) {
    pastLectures.innerHTML = "<p>No past lectures found.</p>";
    return;
  }

  snapshot.forEach((docSnap) => {
    const lecture = docSnap.data();

    pastLectures.innerHTML += `
      <div class="lecture-card">
        <h3>${lecture.title} (${lecture.code})</h3>
        <p>Lecturer: ${lecture.lecturer}</p>
        <p><small>Posted: ${lecture.createdAt?.toDate().toLocaleString() || "N/A"}</small></p>
        <a href="studentpg.html?id=${docSnap.id}" class="join-btn">Watch Again</a>
      </div>
    `;
  });
});

// === Logout ===
window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "LIVE.html";
  }).catch((error) => {
    console.error("Logout error:", error);
  });
};
