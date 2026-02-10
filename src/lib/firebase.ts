import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCswvU0yb08Yo6liANP6jSC3uc0oGwG3DM",
    authDomain: "tsue-s-p.firebaseapp.com",
    databaseURL: "https://monarch-presentations-default-rtdb.firebaseio.com",
    projectId: "tsue-s-p",
    storageBucket: "tsue-s-p.firebasestorage.app",
    messagingSenderId: "45313626370",
    appId: "1:45313626370:web:ca53bf9ce09fdd1652721b",
    measurementId: "G-7SVTQRL8GW"
};

const app = initializeApp(firebaseConfig);

// Keep existing RTDB from monarch-presentations (has all data)
export const database = getDatabase(app, "https://monarch-presentations-default-rtdb.firebaseio.com");
export const auth = getAuth(app);

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
