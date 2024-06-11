import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:import.meta.env.VITE_API_KEY ,
  authDomain: "reactchat-5046c.firebaseapp.com",
  projectId: "reactchat-5046c",
  storageBucket: "reactchat-5046c.appspot.com",
  messagingSenderId: "290759497332",
  appId: "1:290759497332:web:20e9ed8bb25f82e95ea321"
};

const app = initializeApp(firebaseConfig);

export const auth=getAuth()
export const db=getFirestore()
export const storage=getStorage()