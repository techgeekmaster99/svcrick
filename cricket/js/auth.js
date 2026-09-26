import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";
import { AUTH_EMAIL_DOMAIN, DEFAULT_PASSWORD, ADMIN_FLAT_NUMBER } from "./firebase-config.js";

export function flatNumberToEmail(flatNumber) {
  return `${flatNumber.trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;
}

export function emailToFlatNumber(email) {
  return email.split("@")[0].toUpperCase();
}

export function isAdminFlat(flatNumber) {
  return flatNumber === ADMIN_FLAT_NUMBER;
}

// Signs in a flat. If the flat has never logged in before and the password
// given is the shared default password, the account is created on the fly
// (there is no server to pre-provision accounts ahead of time) and flagged
// so the app forces a password change before anything else.
export async function login(flatNumber, password) {
  const email = flatNumberToEmail(flatNumber);

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (err) {
    // Firebase's newer projects return a generic "invalid-credential" error for
    // both "wrong password" and "no such user" (to avoid leaking which one it
    // is), so we can no longer branch on the sign-in error code. Instead: if
    // the default password was used, attempt to create the account — if one
    // already exists, createUser will fail with "email-already-in-use" and we
    // know the real problem was just a wrong password.
    if (password === DEFAULT_PASSWORD) {
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", credential.user.uid), {
          flatNumber: flatNumber.trim().toUpperCase(),
          mustChangePassword: true,
        });
        return credential.user;
      } catch (createErr) {
        if (createErr.code === "auth/email-already-in-use") {
          throw err;
        }
        throw createErr;
      }
    }
    throw err;
  }
}

export async function logout() {
  await signOut(auth);
}

export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// Redirects to login.html if signed out, otherwise calls onReady(user, userDoc).
export function requireAuth(onReady) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    const userDoc = await getUserDoc(user.uid);
    onReady(user, userDoc);
  });
}

export function loginErrorMessage(err) {
  if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
    return "Invalid flat number or password.";
  }
  if (err.code === "auth/user-not-found") {
    return "Invalid flat number or password.";
  }
  if (err.code === "auth/too-many-requests") {
    return "Too many attempts. Please wait a moment and try again.";
  }
  return "Login failed. Please try again.";
}
