import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Credenciais do projeto Firebase — idealmente movidas para variáveis de ambiente (.env.local)
const firebaseConfig = {
  apiKey: "AIzaSyDPZ-3tLCFCiGsJRuxja_kfS0gzYTzsMV0",
  authDomain: "estoque-app-d2df2.firebaseapp.com",
  projectId: "estoque-app-d2df2",
  storageBucket: "estoque-app-d2df2.firebasestorage.app",
  messagingSenderId: "217455891215",
  appId: "1:217455891215:web:3a96e959b3c823a640a47a"
};

// Inicializa o Firebase com as configurações do projeto
const app = initializeApp(firebaseConfig);

// Instância de autenticação compartilhada entre os demais módulos da aplicação
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
