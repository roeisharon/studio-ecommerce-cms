/**
 * Firebase Firestore CRUD helper
 * Provides a consistent interface matching the Firestore API shape.
 *
 * Key design decisions:
 * - filter() with multiple fields + orderBy requires Firestore composite indexes.
 *   To avoid that, we fetch all matching docs WITHOUT orderBy, then sort client-side.
 * - filter({ id: '...' }) is intercepted and routed to a direct document get()
 *   because Firestore stores the ID as the document key, not a field.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toDate = (val) => {
  if (!val) return null;
  if (val instanceof Timestamp) return val.toDate().toISOString();
  return val;
};

const normalizeDoc = (docSnap) => {
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    created_date:  toDate(data.created_date),
    updated_date:  toDate(data.updated_date),
    published_date: toDate(data.published_date),
  };
};

const clientSort = (items, sortField) => {
  const desc  = sortField.startsWith('-');
  const field = sortField.replace(/^-/, '');
  return [...items].sort((a, b) => {
    const av = a[field] ?? '';
    const bv = b[field] ?? '';
    if (av < bv) return desc ? 1 : -1;
    if (av > bv) return desc ? -1 : 1;
    return 0;
  });
};

// ─── Entity factory ───────────────────────────────────────────────────────────

export const createFirestoreEntity = (collectionName) => ({

  /**
   * List all documents, sorted client-side to avoid index requirements.
   */
  list: async (sortField = '-created_date', maxDocs = 100) => {
    const snap = await getDocs(collection(db, collectionName));
    const items = snap.docs.map(normalizeDoc);
    return clientSort(items, sortField).slice(0, maxDocs);
  },

  /**
   * Filter documents by exact field matches.
   *
   * Special case: { id: '...' } fetches a single doc by its Firestore document ID
   * instead of querying a field — because Firestore doesn't store id as a field.
   *
   * For all other filters we apply where() clauses without orderBy so Firestore
   * never requires a composite index. Sorting happens client-side.
   */
  filter: async (filters = {}, sortField = '-created_date', maxDocs = 100) => {
    // Special case: looking up a single document by its Firestore ID
    if (filters.id) {
      const docSnap = await getDoc(doc(db, collectionName, filters.id));
      if (!docSnap.exists()) return [];
      const item = normalizeDoc(docSnap);
      // Apply any remaining filters (other than id)
      const rest = Object.entries(filters).filter(([k]) => k !== 'id');
      if (rest.some(([k, v]) => item[k] !== v)) return [];
      return [item];
    }

    // General case: build where() constraints, sort client-side
    const constraints = Object.entries(filters).map(([k, v]) => where(k, '==', v));
    const q = query(collection(db, collectionName), ...constraints, limit(500));
    const snap = await getDocs(q);
    const items = snap.docs.map(normalizeDoc);
    return clientSort(items, sortField).slice(0, maxDocs);
  },

  /**
   * Fetch a single document by its Firestore document ID.
   */
  get: async (id) => {
    const docSnap = await getDoc(doc(db, collectionName, id));
    if (!docSnap.exists()) return null;
    return normalizeDoc(docSnap);
  },

  /**
   * Create a new document. Returns the created item with its Firestore ID.
   */
  create: async (data) => {
    const payload = {
      ...data,
      created_date: serverTimestamp(),
      updated_date: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, collectionName), payload);
    return { ...data, id: docRef.id, created_date: new Date().toISOString() };
  },

  /**
   * Update an existing document by Firestore document ID.
   */
  update: async (id, data) => {
    const ref = doc(db, collectionName, id);
    await updateDoc(ref, { ...data, updated_date: serverTimestamp() });
    return { ...data, id };
  },

  /**
   * Delete a document by Firestore document ID.
   */
  delete: async (id) => {
    await deleteDoc(doc(db, collectionName, id));
    return { success: true };
  },
});
