const fs = require('fs');
const path = require('path');
// firebase-admin v13+ exposes the modular API only; the old `admin.credential.*`
// / `admin.firestore()` namespace was removed, so import from the subpaths.
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const env = require('./env');

let db = null;

function buildCredential() {
  const { serviceAccountPath, projectId, clientEmail, privateKey } = env.firebase;

  // Hosted environments such as Vercel:
  // use Firebase credentials from environment variables.
  if (projectId && clientEmail && privateKey) {
    return cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    });
  }

  // Local development:
  // use the service-account JSON file.
  if (serviceAccountPath) {
    const resolved = path.isAbsolute(serviceAccountPath)
      ? serviceAccountPath
      : path.resolve(process.cwd(), serviceAccountPath);

    if (!fs.existsSync(resolved)) {
      throw new Error(
        `Service account file not found at ${resolved}. ` +
        'Check FIREBASE_SERVICE_ACCOUNT_PATH in backend/.env'
      );
    }

    let serviceAccount;

    try {
      serviceAccount = JSON.parse(fs.readFileSync(resolved, 'utf8'));
    } catch (err) {
      throw new Error(
        `Service account file at ${resolved} is not valid JSON: ${err.message}`
      );
    }

    if (!serviceAccount.project_id || !serviceAccount.private_key) {
      throw new Error(
        `${resolved} does not look like a Firebase service-account key ` +
        '(missing project_id or private_key).'
      );
    }

    return cert(serviceAccount);
  }

  throw new Error(
    'Firebase credentials missing. Set FIREBASE_PROJECT_ID + ' +
    'FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY, or ' +
    'FIREBASE_SERVICE_ACCOUNT_PATH for local development.'
  );
}

function initFirebase() {
  if (!getApps().length) {
    initializeApp({ credential: buildCredential() });
  }
  db = getFirestore();
  db.settings({ ignoreUndefinedProperties: true });
  return db;
}

function getDb() {
  if (!db) initFirebase();
  return db;
}

/** Collection names live here so no module invents its own spelling. */
const collections = {
  admins: 'admins',
  projects: 'projects',
  notices: 'notices',
  publicNotices: 'publicNotices',
  banners: 'banners',
  tenders: 'tenders',
  settings: 'settings',
};

module.exports = { initFirebase, getDb, collections };
