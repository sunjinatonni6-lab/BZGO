import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDHkm_aKYuet_UhT1MOsVlhdTexPVQGvVY",
  authDomain: "bazargo-27302.firebaseapp.com",
  projectId: "bazargo-27302",
  storageBucket: "bazargo-27302.firebasestorage.app",
  messagingSenderId: "605427192439",
  appId: "1:605427192439:web:f44a949b1338a3c4102c72",
  measurementId: "G-WNZHMSY8YT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);