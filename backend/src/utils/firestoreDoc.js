/**
 * Firestore snapshots -> plain JSON the frontend can consume.
 * Timestamps become ISO strings; the document id is folded into the object.
 */
function toPlain(value) {
  if (value && typeof value.toDate === 'function') return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === 'object' && value.constructor === Object) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toPlain(v)]));
  }
  return value;
}

const mapDoc = (snap) => (snap.exists ? { id: snap.id, ...toPlain(snap.data()) } : null);

const mapDocs = (query) => query.docs.map((d) => ({ id: d.id, ...toPlain(d.data()) }));

module.exports = { mapDoc, mapDocs, toPlain };
