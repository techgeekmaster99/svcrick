import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./firebase-init.js";
import { requireAuth, logout, emailToFlatNumber, isAdminFlat } from "./auth.js";

const welcomeEl = document.getElementById("welcome");
const logoutBtn = document.getElementById("logout");
const checklistEl = document.getElementById("player-checklist");
const teamsContainer = document.getElementById("teams-container");
const form = document.getElementById("team-form");
const teamNameInput = document.getElementById("team-name");
const errorEl = document.getElementById("error");
const statusEl = document.getElementById("status");

let flatNumber = null;
let isAdmin = false;
let availablePlayers = [];

requireAuth(async (user, userDoc) => {
  if (userDoc && userDoc.mustChangePassword) {
    window.location.href = "change-password.html";
    return;
  }

  flatNumber = emailToFlatNumber(user.email);
  welcomeEl.textContent = `Welcome, ${flatNumber}`;
  isAdmin = isAdminFlat(flatNumber);

  await loadAll();
});

async function loadAll() {
  const [playersSnapshot, teamsSnapshot] = await Promise.all([
    getDocs(collection(db, "players")),
    getDocs(collection(db, "teams")),
  ]);

  const teams = teamsSnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  const assignedPlayerIds = new Set(teams.flatMap((team) => team.playerIds || []));

  const allPlayers = playersSnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  availablePlayers = allPlayers.filter((p) => !assignedPlayerIds.has(p.id));

  renderChecklist();
  renderTeams(teams);
}

function renderChecklist() {
  if (availablePlayers.length === 0) {
    checklistEl.innerHTML = "<p>No available players (everyone is already on a team).</p>";
    return;
  }

  checklistEl.innerHTML = availablePlayers
    .map(
      (p) => `
      <label>
        <input type="checkbox" value="${p.id}" />
        ${p.name || "Unnamed"} (${p.flatNumber || "-"}) — ${p.role || "-"}
      </label>`
    )
    .join("");
}

function renderTeams(teams) {
  if (teams.length === 0) {
    teamsContainer.innerHTML = "<p>No teams created yet.</p>";
    return;
  }

  teamsContainer.innerHTML = teams
    .map((team) => {
      const rosterItems = (team.playerNames || []).map((name) => `<li>${name}</li>`).join("");
      const deleteBtn = isAdmin
        ? `<button type="button" class="delete-team-btn" data-id="${team.id}">Delete Team</button>`
        : "";
      return `
        <div class="team-card">
          <h3>${team.name}</h3>
          <ul>${rosterItems}</ul>
          ${deleteBtn}
        </div>`;
    })
    .join("");

  if (isAdmin) {
    teamsContainer.querySelectorAll(".delete-team-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await deleteDoc(doc(db, "teams", btn.dataset.id));
        await loadAll();
      });
    });
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";

  const selectedIds = Array.from(
    checklistEl.querySelectorAll("input[type=checkbox]:checked")
  ).map((el) => el.value);

  if (selectedIds.length === 0) {
    errorEl.textContent = "Select at least one player.";
    return;
  }

  const selectedPlayers = availablePlayers.filter((p) => selectedIds.includes(p.id));

  await addDoc(collection(db, "teams"), {
    name: teamNameInput.value.trim(),
    playerIds: selectedIds,
    playerNames: selectedPlayers.map((p) => `${p.name} (${p.flatNumber}) — ${p.role}`),
    createdBy: flatNumber,
    createdAt: new Date().toISOString(),
  });

  statusEl.textContent = "Team created!";
  setTimeout(() => (statusEl.textContent = ""), 2000);
  form.reset();
  await loadAll();
});

logoutBtn.addEventListener("click", async () => {
  await logout();
  window.location.href = "login.html";
});
