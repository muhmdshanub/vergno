
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import 'firebase/auth';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2KSHiwBdIPR6qBeRwoIvHnRjgeIyxj8I",
  authDomain: "vergno-38150.firebaseapp.com",
  projectId: "vergno-38150",
  storageBucket: "vergno-38150.appspot.com",
  messagingSenderId: "1047052609842",
  appId: "1:1047052609842:web:b8e48eb8bb5b6b94198f2b",
  measurementId: "G-83E1XEBW5S"
};

// Initialize Firebase
export const  firebaseApp = initializeApp(firebaseConfig);
