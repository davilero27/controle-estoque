"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdTokenResult,
  User,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

import type { UserRole } from "@/lib/types";

import { getUserProfile } from "@/services/organizations";

interface AuthContextData {
  user: User | null;
  loading: boolean;
  organizationId: string | null;
  tenantId: string | null;
  role?: UserRole;
  refreshProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | undefined>(undefined);

  // Carrega perfil do usuário
  async function loadProfile(currentUser: User) {
    const token = await getIdTokenResult(currentUser);

    const claims = token.claims as {
      organizationId?: string;
      tenantId?: string;
      role?: UserRole;
    };

    // ✅ Protege contra erro de permissão do Firestore
    let profile = null;
    try {
      profile = await getUserProfile(currentUser.uid);
    } catch (err) {
      console.warn("Não foi possível carregar perfil do Firestore:", err);
    }

    const nextOrganizationId =
      claims.organizationId ??
      claims.tenantId ??
      profile?.organizationId ??
      null;

    const nextRole = claims.role ?? profile?.role ?? "employee";

    setOrganizationId(nextOrganizationId);
    setRole(nextRole);

    // Cookie de sessão
    document.cookie = [
      "stockpro_session=authenticated",
      "path=/",
      "SameSite=Lax",
      "max-age=604800",
    ].join("; ");
  }

  // Atualiza perfil
  async function refreshProfile() {
    if (!auth.currentUser) return;
    await loadProfile(auth.currentUser);
  }

  // Login
  async function login(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await loadProfile(credential.user);
  }

  // Logout
  async function logout() {
    await signOut(auth);
    document.cookie = "stockpro_session=; path=/; max-age=0; SameSite=Lax";
  }

  // Listener de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await loadProfile(currentUser);
      } else {
        setOrganizationId(null);
        setRole(undefined);
        document.cookie = "stockpro_session=; path=/; max-age=0; SameSite=Lax";
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        organizationId,
        tenantId: organizationId,
        role,
        refreshProfile,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}