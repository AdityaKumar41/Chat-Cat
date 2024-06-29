import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chatcat-abc4c.firebaseapp.com",
  projectId: "chatcat-abc4c",
  storageBucket: "chatcat-abc4c.appspot.com",
  messagingSenderId: "892841924100",
  appId: "1:892841924100:web:9c5c460f8582ff5fa1c751",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
