import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCOeG2OEenT279bflGLztT8fiR2Be_PwXo",
  authDomain: "zentask-dashboard-v2-777.firebaseapp.com",
  projectId: "zentask-dashboard-v2-777",
  storageBucket: "zentask-dashboard-v2-777.firebasestorage.app",
  messagingSenderId: "138616784723",
  appId: "1:138616784723:web:729fc0c4c3053f5e8203a6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
