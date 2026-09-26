import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./firebase-init.js";
import { requireAuth, logout, emailToFlatNumber } from "./auth.js";

const welcomeEl = document.getElementById("welcome");
const form = document.getElementById("player-form");
const nameInput = document.getElementById("player-name");
const mobileInput = document.getElementById("player-mobile");
const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");
const logoutBtn = document.getElementById("logout");
const myPlayersEl = document.getElementById("my-players");

let currentUser = null;
let flatNumber = null;

requireAuth(async (user, userDoc) => {
  if (userDoc && userDoc.mustChangePassword) {
    window.location.href = "change-password.html";
    return;
  }

  currentUser = user;
  flatNumber = emailToFlatNumber(user.email);
  welcomeEl.textContent = `Welcome, ${flatNumber}`;

  await loadMyPlayers();
});

async function loadMyPlayers() {
  const q = query(collection(db, "players"), where("ownerUid", "==", currentUser.uid));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    myPlayersEl.innerHTML = "<p>No players added yet from your flat.</p>";
    return;
  }

  myPlayersEl.innerHTML = `
    <table>
      <thead>
        <tr><th>Name</th><th>Mobile Number</th><th>Role</th><th></th></tr>
      </thead>
      <tbody>
        ${snapshot.docs
          .map((docSnap) => {
            const p = docSnap.data();
            return `
              <tr>
                <td>${p.name || "-"}</td>
                <td>${p.mobile || "-"}</td>
                <td>${p.role || "-"}</td>
                <td><button type="button" class="remove-btn" data-id="${docSnap.id}">Remove</button></td>
              </tr>`;
          })
          .join("")}
      </tbody>
    </table>
  `;

  myPlayersEl.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await deleteDoc(doc(db, "players", btn.dataset.id));
      await loadMyPlayers();
    });
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";

  const role = form.querySelector('input[name="role"]:checked');
  if (!role) {
    errorEl.textContent = "Please select a role.";
    return;
  }

  await addDoc(collection(db, "players"), {
    ownerUid: currentUser.uid,
    flatNumber,
    name: nameInput.value.trim(),
    mobile: mobileInput.value.trim(),
    role: role.value,
    updatedAt: new Date().toISOString(),
  });

  form.reset();
  statusEl.textContent = "Added!";
  setTimeout(() => (statusEl.textContent = ""), 2000);
  await loadMyPlayers();
});

logoutBtn.addEventListener("click", async () => {
  await logout();
  window.location.href = "login.html";
});
