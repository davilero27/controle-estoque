import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDPZ-3tLCFCiGsJRuxja_kfS0gzYTzsMV0",
  authDomain: "estoque-app-d2df2.firebaseapp.com",
  projectId: "estoque-app-d2df2",
  storageBucket: "estoque-app-d2df2.firebasestorage.app",
  messagingSenderId: "217455891215",
  appId: "1:217455891215:web:3a96e959b3c823a640a47a"
};

const app = initializeApp(firebaseConfig);
export default app;