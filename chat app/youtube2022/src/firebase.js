import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDUpZPawjyUYeTWh2ZTJH1xuCUEN0QqTVw",
  authDomain: "chat-caeef.firebaseapp.com",
  projectId: "chat-caeef",
  storageBucket: "chat-caeef.appspot.com",
  messagingSenderId: "543865091248",
  appId: "1:543865091248:web:9807725d6a7bdd982b3775",
  measurementId: "G-42M3ZC59HD"
};


export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db=getFirestore();