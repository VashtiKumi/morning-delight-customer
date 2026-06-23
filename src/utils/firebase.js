// ─── Firebase Initialisation ──────────────────────────────────────────
// Shared by customer, vendor and admin apps.
// All three apps connect to the SAME Firebase project so data is shared
// across all devices in real time.
// ─────────────────────────────────────────────────────────────────────

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection, doc,
  setDoc, getDoc, getDocs,
  deleteDoc, onSnapshot,
  serverTimestamp, query, orderBy, limit,
} from 'firebase/firestore';
import FIREBASE_CONFIG from './firebaseConfig';

// ── Initialise once (prevent duplicate app error in hot-reload) ────────
let firebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(FIREBASE_CONFIG);
} else {
  firebaseApp = getApps()[0];
}

export const db = getFirestore(firebaseApp);

// ── Firestore helpers ─────────────────────────────────────────────────
export { collection, doc, setDoc, getDoc, getDocs, deleteDoc, onSnapshot, serverTimestamp, query, orderBy, limit };
export default firebaseApp;
