const { getDb, collections } = require('../../config/firebase');
const { mapDoc, mapDocs } = require('../../utils/firestoreDoc');

const col = () => getDb().collection(collections.admins);

async function findByUsername(username) {
  const snap = await col().where('username', '==', username).limit(1).get();
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

async function findById(id) {
  return mapDoc(await col().doc(id).get());
}

async function create(admin) {
  const ref = await col().add({
    ...admin,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return findById(ref.id);
}

async function list() {
  const snap = await col().orderBy('createdAt', 'asc').get();
  return mapDocs(snap).map(({ passwordHash, ...rest }) => rest);
}

async function update(id, changes) {
  await col().doc(id).update({ ...changes, updatedAt: new Date().toISOString() });
  return findById(id);
}

async function remove(id) {
  await col().doc(id).delete();
}

async function count() {
  const snap = await col().count().get();
  return snap.data().count;
}

module.exports = { findByUsername, findById, create, list, update, remove, count };
