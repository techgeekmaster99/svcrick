import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./firebase-init.js";
import { requireAuth, logout, emailToFlatNumber, isAdminFlat } from "./auth.js";

const welcomeEl = document.getElementById("welcome");
const tableBody = document.getElementById("players-body");
const errorEl = document.getElementById("error");
const logoutBtn = document.getElementById("logout");
const tableHead = document.getElementById("players-head");

let isAdmin = false;

requireAuth(async (user, userDoc) => {
  if (userDoc && userDoc.mustChangePassword) {
    window.location.href = "change-password.html";
    return;
  }

  const flatNumber = emailToFlatNumber(user.email);
  welcomeEl.textContent = `Welcome, ${flatNumber}`;
  isAdmin = isAdminFlat(flatNumber);

  if (isAdmin) {
    tableHead.querySelector("tr").insertAdjacentHTML("beforeend", "<th></th>");
  }

  await loadPlayers();
});

async function loadPlayers() {
  try {
    const snapshot = await getDocs(collection(db, "players"));
    tableBody.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.flatNumber || "-"}</td>
        <td>${data.name || "-"}</td>
        <td>${data.mobile || "-"}</td>
        <td>${data.role || "-"}</td>
        ${isAdmin ? `<td><button type="button" class="remove-btn" data-id="${docSnap.id}">Delete</button></td>` : ""}
      `;
      tableBody.appendChild(row);
    });

    if (isAdmin) {
      tableBody.querySelectorAll(".remove-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          await deleteDoc(doc(db, "players", btn.dataset.id));
          await loadPlayers();
        });
      });
    }
  } catch (err) {
    console.error(err);
    errorEl.textContent = `Could not load players (${err.code || err.message}). Check Firestore security rules.`;
  }
}

logoutBtn.addEventListener("click", async () => {
  await logout();
  window.location.href = "login.html";
});
