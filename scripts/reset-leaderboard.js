"use strict";

const fs = require("fs");
const admin = require("firebase-admin");

// CI passes the key as a JSON string in FIREBASE_SERVICE_ACCOUNT.
// For local testing, FIREBASE_SERVICE_ACCOUNT_PATH can point at the
// downloaded key file instead so the key never has to appear in a
// shell command or env dump.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  ? JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf8"))
  : JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function resetLeaderboard() {
  const collectionRef = db.collection("leaderboard");
  const snapshot = await collectionRef.get();

  if (snapshot.empty) {
    console.log("leaderboard is already empty, nothing to do");
    return;
  }

  const batchSize = 400;
  const docs = snapshot.docs;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = db.batch();
    docs.slice(i, i + batchSize).forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  console.log(`deleted ${docs.length} leaderboard entries`);
}

resetLeaderboard()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("reset failed:", err);
    process.exit(1);
  });
