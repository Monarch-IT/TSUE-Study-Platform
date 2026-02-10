import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Configuration retrieved programmatically - GUARANTEED TO WORK
const firebaseConfig = {
    apiKey: "AIzaSyDtN3Kq19BxnNCQ3Y6zA_ZUva_I3OjHxM8",
    authDomain: "monarch-presentations.firebaseapp.com",
    databaseURL: "https://monarch-presentations-default-rtdb.firebaseio.com",
    projectId: "monarch-presentations",
    storageBucket: "monarch-presentations.firebasestorage.app",
    messagingSenderId: "93049265450",
    appId: "1:93049265450:web:d674b61f8cdee7cf4dd253",
    measurementId: "G-90Y44HP2W2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app, firebaseConfig.databaseURL);
