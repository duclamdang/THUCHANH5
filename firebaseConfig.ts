import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyALVQLaWTwGNkewffEV8mArjUOLtO1s2us",
  authDomain: "fir-9835d.firebaseapp.com",
  projectId: "fir-9835d",
  storageBucket: "fir-9835d.firebasestorage.app",
  messagingSenderId: "140431895321",
  appId: "1:140431895321:web:f9944ec9b19249b2dab388",
  measurementId: "G-G99MCJM1DR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { auth, db };
