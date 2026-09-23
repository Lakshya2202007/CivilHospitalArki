const { getDb, collections } = require('../../config/firebase');
const { mapDoc, mapDocs } = require('../../utils/firestoreDoc');

const col = () => getDb().collection(collections.banners);

async function findAll() {
  const snap = await col().orderBy('displayOrder', 'asc').get();
  return mapDocs(snap);
}

async function findById(id) {
  return mapDoc(await col().doc(id).get());
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

module.exports = { findAll, findById, create, update, remove };
