import { login, loginErrorMessage, getUserDoc } from "./auth.js";

const form = document.getElementById("login-form");
const errorEl = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";

  const flatNumber = document.getElementById("flat-number").value.trim();
  const password = document.getElementById("password").value;

  if (!flatNumber || !password) {
    errorEl.textContent = "Please enter both flat number and password.";
    return;
  }

  try {
    const user = await login(flatNumber, password);
    const userDoc = await getUserDoc(user.uid);

    if (userDoc && userDoc.mustChangePassword) {
      window.location.href = "change-password.html";
      return;
    }

    window.location.href = "profile.html";
  } catch (err) {
    errorEl.textContent = loginErrorMessage(err);
  }
});
