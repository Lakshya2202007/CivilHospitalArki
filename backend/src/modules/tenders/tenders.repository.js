const { getDb, collections } = require('../../config/firebase');
const { mapDoc, mapDocs } = require('../../utils/firestoreDoc');

const col = () => getDb().collection(collections.tenders);

async function findAll() {
  const snap = await col().orderBy('closingDate', 'desc').get();
  return mapDocs(snap);
}

async function findById(id) {
  return mapDoc(await col().doc(id).get());
}

async function findByTenderId(tenderId) {
  const snap = await col().where('tenderId', '==', tenderId).limit(1).get();
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

async function create(data) {
  const now = new Date().toISOString();
  const ref = await col().add({ ...data, createdAt: now, updatedAt: now });
  return findById(ref.id);
}

async function update(id, changes) {
  await col().doc(id).update({ ...changes, updatedAt: new Date().toISOString() });
  return findById(id);
}

async function remove(id) {
  await col().doc(id).delete();
}

module.exports = { findAll, findById, findByTenderId, create, update, remove };
