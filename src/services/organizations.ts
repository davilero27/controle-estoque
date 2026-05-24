import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firestore";

import type {
  Organization,
  OrganizationInvite,
  UserRole,
} from "@/lib/types";

export interface UserProfile {
  uid: string;
  email: string;
  organizationId: string | null;
  role: UserRole;
}

// ─── Refs ────────────────────────────────────────────────────────────────────

export function getUserProfileRef(uid: string) {
  return doc(db, "users", uid);
}

export function getOrganizationRef(organizationId: string) {
  return doc(db, "organizations", organizationId);
}

// ─── Leitura ─────────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  // ✅ Lança o erro para o chamador tratar (AuthContext já tem try/catch)
  const snapshot = await getDoc(getUserProfileRef(uid));

  if (!snapshot.exists()) return null;

  return snapshot.data() as UserProfile;
}

export async function getOrganization(
  organizationId: string
): Promise<Organization | null> {
  const snapshot = await getDoc(getOrganizationRef(organizationId));

  if (!snapshot.exists()) return null;

  return { id: snapshot.id, ...snapshot.data() } as Organization;
}

// ─── Criação de organização ───────────────────────────────────────────────────

export async function createOrganizationForUser({
  uid,
  email,
  name,
}: {
  uid: string;
  email: string;
  name: string;
}) {
  const organizationId = uid;
  const batch = writeBatch(db);

  const organizationRef = getOrganizationRef(organizationId);
  const userRef = getUserProfileRef(uid);
  const memberRef = doc(db, "organizations", organizationId, "members", uid);

  // Organização
  batch.set(organizationRef, {
    name,
    ownerId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Usuário
  batch.set(userRef, {
    uid,
    email,
    organizationId,
    role: "owner",
    updatedAt: serverTimestamp(),
  });

  // Membro
  batch.set(memberRef, {
    uid,
    email,
    role: "owner",
    status: "active",
    createdAt: serverTimestamp(),
  });

  await batch.commit();

  return organizationId;
}

// ─── Atualização ─────────────────────────────────────────────────────────────

export async function updateOrganizationName(
  organizationId: string,
  name: string
) {
  await setDoc(
    getOrganizationRef(organizationId),
    { name, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// ─── Convites ─────────────────────────────────────────────────────────────────

export async function createOrganizationInvite({
  organizationId,
  email,
  role,
}: {
  organizationId: string;
  email: string;
  role: UserRole;
}) {
  const inviteRef = doc(
    collection(db, "organizations", organizationId, "invites")
  );

  await setDoc(inviteRef, {
    email,
    role,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export async function listOrganizationInvites(
  organizationId: string
): Promise<OrganizationInvite[]> {
  const invitesQuery = query(
    collection(db, "organizations", organizationId, "invites"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(invitesQuery);

  return snapshot.docs.map((inviteDoc) => ({
    id: inviteDoc.id,
    ...inviteDoc.data(),
  })) as OrganizationInvite[];
}

// ─── Migração legado ──────────────────────────────────────────────────────────

export async function migrateLegacyData(organizationId: string) {
  const [productsSnapshot, salesSnapshot] = await Promise.all([
    getDocs(collection(db, "produtos")),
    getDocs(collection(db, "vendas")),
  ]);

  const batch = writeBatch(db);

  // Produtos
  productsSnapshot.docs.forEach((productDoc) => {
    batch.set(
      doc(db, "organizations", organizationId, "produtos", productDoc.id),
      { ...productDoc.data(), organizationId, migratedAt: serverTimestamp() },
      { merge: true }
    );
  });

  // Vendas
  salesSnapshot.docs.forEach((saleDoc) => {
    batch.set(
      doc(db, "organizations", organizationId, "vendas", saleDoc.id),
      { ...saleDoc.data(), organizationId, migratedAt: serverTimestamp() },
      { merge: true }
    );
  });

  await batch.commit();

  return {
    products: productsSnapshot.size,
    sales: salesSnapshot.size,
  };
}