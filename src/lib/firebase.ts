// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4N5bESQcP_Sjgn3wEHgus3qggZWKIVf8",
  authDomain: "calculadora-compra.firebaseapp.com",
  projectId: "calculadora-compra",
  storageBucket: "calculadora-compra.appspot.com",
  messagingSenderId: "394288360893",
  appId: "1:394288360893:web:86e7128687a28757ecb6d4",
  measurementId: "G-SJP1NY3BPR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
