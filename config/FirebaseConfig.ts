// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyCemwCno6kSi5GrfCH8MOlzTEJpDR2pb6o",
  authDomain: "micro-learn-native-app.firebaseapp.com",
  projectId: "micro-learn-native-app",
  storageBucket: "micro-learn-native-app.appspot.com",
  messagingSenderId: "162438701462",
  appId: "1:162438701462:web:300d3121c370ef886efdb7",
  measurementId: "G-8TVWRCMMHE",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
// const analytics = getAnalytics(app);
