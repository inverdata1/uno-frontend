import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Base service class for Firebase operations
 * Provides common CRUD operations that can be extended by specific resources
 */
export class BaseFirebaseService {
  constructor(client, collectionName) {
    this.client = client; // Store client reference for accessing other resources
    this.db = client.db;
    this.collectionName = collectionName;
    this.collection = collection(this.db, collectionName);
  }

  /**
   * Find document by ID
   * @param {string} id - Document ID
   * @returns {Promise<Object>} Document data with ID
   */
  async findById(id) {
    const docSnap = await getDoc(doc(this.db, this.collectionName, id));

    if (!docSnap.exists()) {
      throw new Error(`${this.collectionName} with id ${id} not found`);
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  }

  /**
   * Find all documents with optional filters and options
   * @param {Object} filters - Key-value pairs for where clauses
   * @param {Object} options - Query options (orderBy, order, limit)
   * @returns {Promise<Array>} Array of documents
   */
  async findAll(filters = {}, options = {}) {
    let q = collection(this.db, this.collectionName);

    // Apply filters
    Object.entries(filters).forEach(([field, value]) => {
      q = query(q, where(field, '==', value));
    });

    // Apply ordering
    if (options.orderBy) {
      q = query(q, orderBy(options.orderBy, options.order || 'asc'));
    }

    // Apply limit
    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Create a new document
   * @param {Object} data - Document data
   * @param {string} [customId] - Optional custom document ID
   * @returns {Promise<Object>} Created document with ID
   */
  async create(data, customId = null) {
    const docData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    let docRef;
    let documentId;

    if (customId) {
      // Use setDoc with custom ID
      docRef = doc(this.db, this.collectionName, customId);
      await setDoc(docRef, docData);
      documentId = customId;
    } else {
      // Use addDoc for auto-generated ID
      docRef = await addDoc(collection(this.db, this.collectionName), docData);
      documentId = docRef.id;
    }

    // Return with actual timestamp since serverTimestamp() returns null initially
    return {
      id: documentId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Update document by ID
   * @param {string} id - Document ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated document
   */
  async update(id, data) {
    const docData = {
      ...data,
      updatedAt: serverTimestamp()
    };

    await updateDoc(doc(this.db, this.collectionName, id), docData);

    // Return fresh data
    return this.findById(id);
  }

  /**
   * Delete document by ID
   * @param {string} id - Document ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(id) {
    await deleteDoc(doc(this.db, this.collectionName, id));
    return { id, deleted: true };
  }

  /**
   * Find documents with complex where conditions
   * @param {Array} conditions - Array of [field, operator, value] tuples
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of documents
   */
  async findWhere(conditions, options = {}) {
    let q = collection(this.db, this.collectionName);

    conditions.forEach(([field, operator, value]) => {
      q = query(q, where(field, operator, value));
    });

    if (options.orderBy) {
      q = query(q, orderBy(options.orderBy, options.order || 'asc'));
    }

    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Find first document matching conditions
   * @param {Array} conditions - Array of [field, operator, value] tuples
   * @returns {Promise<Object|null>} First matching document or null
   */
  async findOne(conditions) {
    const results = await this.findWhere(conditions, { limit: 1 });
    return results[0] || null;
  }

  /**
   * Check if document exists
   * @param {string} id - Document ID
   * @returns {Promise<boolean>} Whether document exists
   */
  async exists(id) {
    try {
      await this.findById(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Count documents matching filters
   * @param {Object} filters - Key-value pairs for where clauses
   * @returns {Promise<number>} Number of matching documents
   */
  async count(filters = {}) {
    const docs = await this.findAll(filters);
    return docs.length;
  }
}