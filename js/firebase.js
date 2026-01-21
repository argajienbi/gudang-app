import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBf-CoZksAWgCOx6AU6iNDA0onLbimEgD0",
  authDomain: "gudang-app-arga.firebaseapp.com",
  projectId: "gudang-app-arga",
  storageBucket: "gudang-app-arga.firebasestorage.app",
  messagingSenderId: "153673424764",
  appId: "1:153673424764:web:d472786029742584894ef9",
  measurementId: "G-G1S326BD16"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);