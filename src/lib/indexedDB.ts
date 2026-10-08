import { Book, User, Review, Question, ShelfItem, CuratedList } from '../types';

const DB_NAME = 'IndiePicksDB';
const DB_VERSION = 1;

const STORES = {
  BOOKS: 'books',
  USERS: 'users',
  REVIEWS: 'reviews',
  QUESTIONS: 'questions',
  SHELVES: 'shelves',
  LISTS: 'lists',
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCollectionToIndexedDB<T extends { id: string }>(
  storeName: string,
  items: T[]
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.clear();
    items.forEach((item) => store.put(item));
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn(`IndexedDB save error for ${storeName}:`, err);
  }
}

export async function loadCollectionFromIndexedDB<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`IndexedDB load error for ${storeName}:`, err);
    return [];
  }
}

export async function syncAllToIndexedDB(data: {
  books: Book[];
  users: User[];
  reviews: Review[];
  questions: Question[];
  shelves: ShelfItem[];
  lists: CuratedList[];
}): Promise<void> {
  await Promise.all([
    saveCollectionToIndexedDB(STORES.BOOKS, data.books),
    saveCollectionToIndexedDB(STORES.USERS, data.users),
    saveCollectionToIndexedDB(STORES.REVIEWS, data.reviews),
    saveCollectionToIndexedDB(STORES.QUESTIONS, data.questions),
    saveCollectionToIndexedDB(STORES.SHELVES, data.shelves),
    saveCollectionToIndexedDB(STORES.LISTS, data.lists),
  ]);
}

export async function loadAllFromIndexedDB(): Promise<{
  books: Book[];
  users: User[];
  reviews: Review[];
  questions: Question[];
  shelves: ShelfItem[];
  lists: CuratedList[];
} | null> {
  try {
    const [books, users, reviews, questions, shelves, lists] = await Promise.all([
      loadCollectionFromIndexedDB<Book>(STORES.BOOKS),
      loadCollectionFromIndexedDB<User>(STORES.USERS),
      loadCollectionFromIndexedDB<Review>(STORES.REVIEWS),
      loadCollectionFromIndexedDB<Question>(STORES.QUESTIONS),
      loadCollectionFromIndexedDB<ShelfItem>(STORES.SHELVES),
      loadCollectionFromIndexedDB<CuratedList>(STORES.LISTS),
    ]);

    // Return if any store has cached data
    if (books.length || users.length) {
      return { books, users, reviews, questions, shelves, lists };
    }
    return null;
  } catch {
    return null;
  }
}
