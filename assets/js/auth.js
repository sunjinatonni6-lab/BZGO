import { auth, db } from "./firebase-config.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

export async function registerCustomer(email, password, fullName) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const userRef = doc(db, "users", credential.user.uid);
  await setDoc(userRef, {
    fullName,
    email,
    role: "customer",
    createdAt: serverTimestamp()
  });
  return credential.user;
}

export async function loginCustomer(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logoutUser() {
  await signOut(auth);
  window.location.href = "/login.html";
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export function initAuthListener(onUserResolved) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const profile = snap.exists() ? snap.data() : null;
        onUserResolved({ user, profile });
      } catch (e) {
        onUserResolved({ user, profile: null });
      }
    } else {
      onUserResolved({ user: null, profile: null });
    }
  });
}

export function requireAdminGuard() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "../login.html";
      return;
    }
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists() || snap.data().role !== "admin") {
        alert("Access Denied: Administrator account required.");
        await signOut(auth);
        window.location.href = "../login.html";
      }
    } catch (e) {
      window.location.href = "../login.html";
    }
  });
}