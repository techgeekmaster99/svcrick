// Fill this in with the config from your Firebase project:
// Firebase console -> Project settings -> General -> "Your apps" -> SDK setup and configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCT7bPl8WeT6GDMR810WlrFWmgxsngyzTY",
  authDomain: "svprimecricketleague.firebaseapp.com",
  projectId: "svprimecricketleague",
  storageBucket: "svprimecricketleague.firebasestorage.app",
  messagingSenderId: "194018205206",
  appId: "1:194018205206:web:28917b18849b5c92d91f37",
};

// Email domain used to turn a flat number into a Firebase Auth email
// (Firebase Auth requires an email-shaped identifier; nothing is ever sent to it).
export const AUTH_EMAIL_DOMAIN = "svprime.local";

export const DEFAULT_PASSWORD = "Admin123";

// This flat has admin powers: delete any team, delete any player entry
// (regular flats can only delete players/teams they created themselves).
export const ADMIN_FLAT_NUMBER = "B-206";
