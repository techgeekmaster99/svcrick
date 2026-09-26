import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./firebase-init.js";
import { requireAuth, emailToFlatNumber } from "./auth.js";

const form = document.getElementById("change-password-form");
const errorEl = document.getElementById("error");
const welcomeEl = document.getElementById("welcome");

let currentUser = null;

requireAuth((user, userDoc) => {
  currentUser = user;
  welcomeEl.textContent = `Welcome, ${emailToFlatNumber(user.email)}`;
  if (userDoc && !userDoc.mustChangePassword) {
    // Password already set up; still allow voluntary changes from this page.
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";

  const currentPassword = document.getElementById("current-password").value;
  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (newPassword.length < 6) {
    errorEl.textContent = "New password must be at least 6 characters.";
    return;
  }
  if (newPassword !== confirmPassword) {
    errorEl.textContent = "New passwords do not match.";
    return;
  }

  try {
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);
    await setDoc(
      doc(db, "users", currentUser.uid),
      { flatNumber: emailToFlatNumber(currentUser.email), mustChangePassword: false },
      { merge: true }
    );
    window.location.href = "profile.html";
  } catch (err) {
    if (err.code === "auth/weak-password") {
      errorEl.textContent = "New password must be at least 6 characters.";
    } else {
      errorEl.textContent = "Current password is incorrect.";
    }
  }
});
