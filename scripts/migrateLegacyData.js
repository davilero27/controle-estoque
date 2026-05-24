const admin = require("firebase-admin");

const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrate() {

  const organizationId =
    "m9ZDjq8nHZzfRJTsLg4KSyl48J2";

  console.log(
    "Iniciando migração..."
  );

  // =========================
  // PRODUTOS
  // =========================

  const productsSnapshot =
    await db
      .collection("produtos")
      .get();

  for (const productDoc of productsSnapshot.docs) {

    await db
      .collection("organizations")
      .doc(organizationId)
      .collection("produtos")
      .doc(productDoc.id)
      .set({
        ...productDoc.data(),
        organizationId,
        migratedAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log(
      `Produto migrado: ${productDoc.id}`
    );
  }

  // =========================
  // VENDAS
  // =========================

  const salesSnapshot =
    await db
      .collection("vendas")
      .get();

  for (const saleDoc of salesSnapshot.docs) {

    await db
      .collection("organizations")
      .doc(organizationId)
      .collection("vendas")
      .doc(saleDoc.id)
      .set({
        ...saleDoc.data(),
        organizationId,
        migratedAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log(
      `Venda migrada: ${saleDoc.id}`
    );
  }

  console.log(
    "Migração concluída!"
  );
}

migrate().catch(console.error);