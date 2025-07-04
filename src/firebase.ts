import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Correct Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyASrtX1sIXMlJ92qN_DjwX0QFoNJLpr5V0",
  authDomain: "studentteacherconsultati-cd7df.firebaseapp.com",
  projectId: "studentteacherconsultati-cd7df",
  storageBucket: "studentteacherconsultati-cd7df.appspot.com", // ✅ fixed
  messagingSenderId: "574181705452",
  appId: "1:574181705452:web:15400863e56b9e452c87c9"
};

// ✅ Prevent re-initialization in development/hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
// ✅ Export app for potential future use
export { app };