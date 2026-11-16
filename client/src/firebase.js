import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC-cP3s5Kys26CLuT9UMIc0B0pjH-e_BG4",
  authDomain: "blog-portfolio-f6ed5.firebaseapp.com",
  projectId: "blog-portfolio-f6ed5",
  storageBucket: "blog-portfolio-f6ed5.firebasestorage.app",
  messagingSenderId: "1000732297748",
  appId: "1:1000732297748:web:1e20f61a7e72e770507501",
  measurementId: "G-37JTZQ16KG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);