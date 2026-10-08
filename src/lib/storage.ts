import {
  User,
  Book,
  Review,
  Question,
  CuratedList,
  ShelfItem,
  ShelfStatus,
} from '../types';
import {
  INITIAL_AUTHORS,
  INITIAL_READERS,
  INITIAL_BOOKS,
  INITIAL_REVIEWS,
  INITIAL_QUESTIONS,
  INITIAL_SHELF_ITEMS,
  INITIAL_CURATED_LISTS,
} from '../data/initialData';
import {
  getSavedFirebaseConfig,
  initFirebaseService,
  getRealtimeDb,
} from './firebase';
import { ref, onValue, set } from 'firebase/database';

const KEYS = {
  USERS: 'indie_picks_users',
  BOOKS: 'indie_picks_books',
  REVIEWS: 'indie_picks_reviews',
  QUESTIONS: 'indie_picks_questions',
  SHELVES: 'indie_picks_shelves',
  LISTS: 'indie_picks_lists',
  CURRENT_USER_ID: 'indie_picks_current_user_id',
};

// Word counter helper
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// URL validator ensuring no heavy files/base64 are inserted
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:image')) {
    // Prohibit embedded base64 data to protect free database storage limits
    return false;
  }
  return /^https?:\/\/.+/i.test(trimmed);
}

class StorageEngine {
  private users: User[] = [];
  private books: Book[] = [];
  private reviews: Review[] = [];
  private questions: Question[] = [];
  private shelves: ShelfItem[] = [];
  private lists: CuratedList[] = [];
  private currentUserId: string | null = 'mason-carter';
  private listeners: Set<() => void> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private isFirebaseConnected: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // 1. Load Local
    this.users = this.loadLocal(KEYS.USERS, [...INITIAL_AUTHORS, ...INITIAL_READERS]);
    this.books = this.loadLocal(KEYS.BOOKS, INITIAL_BOOKS);
    this.reviews = this.loadLocal(KEYS.REVIEWS, INITIAL_REVIEWS);
    this.questions = this.loadLocal(KEYS.QUESTIONS, INITIAL_QUESTIONS);
    this.shelves = this.loadLocal(KEYS.SHELVES, INITIAL_SHELF_ITEMS);
    this.lists = this.loadLocal(KEYS.LISTS, INITIAL_CURATED_LISTS);

    const savedUserId = localStorage.getItem(KEYS.CURRENT_USER_ID);
    if (savedUserId && this.users.some((u) => u.id === savedUserId)) {
      this.currentUserId = savedUserId;
    } else if (savedUserId === 'guest') {
      this.currentUserId = null;
    } else {
      this.currentUserId = 'mason-carter';
    }

    // 2. Setup BroadcastChannel for tab synchronization
    try {
      this.broadcastChannel = new BroadcastChannel('indie_picks_live_sync');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'REFRESH_DATA') {
          this.reloadAllLocal();
          this.notify();
        }
      };
    } catch {
      // BroadcastChannel unsupported fallback
    }

    // 3. Connect Firebase if configured
    this.connectFirebase();
  }

  private loadLocal<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn(`Error reading key ${key}`, e);
    }
    return fallback;
  }

  private saveLocal(key: string, data: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save to localStorage (${key})`, e);
    }
  }

  private reloadAllLocal() {
    this.users = this.loadLocal(KEYS.USERS, this.users);
    this.books = this.loadLocal(KEYS.BOOKS, this.books);
    this.reviews = this.loadLocal(KEYS.REVIEWS, this.reviews);
    this.questions = this.loadLocal(KEYS.QUESTIONS, this.questions);
    this.shelves = this.loadLocal(KEYS.SHELVES, this.shelves);
    this.lists = this.loadLocal(KEYS.LISTS, this.lists);
  }

  public connectFirebase() {
    const config = getSavedFirebaseConfig();
    if (!config.enabled || !config.apiKey || !config.databaseURL) {
      this.isFirebaseConnected = false;
      return false;
    }

    const { success, db } = initFirebaseService(config);
    if (success && db) {
      this.isFirebaseConnected = true;

      // Subscribe to Realtime Database collections
      try {
        const rootRef = ref(db, 'indie_picks');
        onValue(rootRef, (snapshot) => {
          const val = snapshot.val();
          if (val) {
            if (val.books) this.books = Object.values(val.books);
            if (val.reviews) this.reviews = Object.values(val.reviews);
            if (val.questions) this.questions = Object.values(val.questions);
            if (val.lists) this.lists = Object.values(val.lists);
            if (val.shelves) this.shelves = Object.values(val.shelves);
            if (val.users) this.users = Object.values(val.users);

            // Save to localStorage as local cache
            this.saveLocal(KEYS.BOOKS, this.books);
            this.saveLocal(KEYS.REVIEWS, this.reviews);
            this.saveLocal(KEYS.QUESTIONS, this.questions);
            this.saveLocal(KEYS.LISTS, this.lists);
            this.saveLocal(KEYS.SHELVES, this.shelves);
            this.saveLocal(KEYS.USERS, this.users);

            this.notify();
          } else {
            // Initial seed push for newly created Firebase database
            set(rootRef, {
              books: this.books,
              reviews: this.reviews,
              questions: this.questions,
              lists: this.lists,
              shelves: this.shelves,
              users: this.users,
            }).catch((e) => console.warn('Initial Firebase seed push:', e));
          }
        });
      } catch (err) {
        console.warn('Realtime database sync error:', err);
      }
      return true;
    }
    this.isFirebaseConnected = false;
    return false;
  }

  private syncToFirebase(node: string, data: unknown) {
    const db = getRealtimeDb();
    if (this.isFirebaseConnected && db) {
      try {
        const nodeRef = ref(db, `indie_picks/${node}`);
        set(nodeRef, data);
      } catch (err) {
        console.error(`Firebase write failed for node ${node}:`, err);
      }
    }
  }

  private persistAndNotify(syncNode?: string, syncData?: unknown) {
    // 1. Save local
    this.saveLocal(KEYS.USERS, this.users);
    this.saveLocal(KEYS.BOOKS, this.books);
    this.saveLocal(KEYS.REVIEWS, this.reviews);
    this.saveLocal(KEYS.QUESTIONS, this.questions);
    this.saveLocal(KEYS.SHELVES, this.shelves);
    this.saveLocal(KEYS.LISTS, this.lists);

    // 2. Broadcast to other tabs
    try {
      this.broadcastChannel?.postMessage({ type: 'REFRESH_DATA' });
    } catch {
      // Ignore
    }

    // 3. Sync to Firebase if applicable
    if (syncNode && syncData !== undefined) {
      this.syncToFirebase(syncNode, syncData);
    }

    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // Getters
  public getUsers(): User[] {
    return [...this.users];
  }

  public getBooks(): Book[] {
    return [...this.books];
  }

  public getReviews(): Review[] {
    return [...this.reviews];
  }

  public getQuestions(): Question[] {
    return [...this.questions];
  }

  public getShelves(): ShelfItem[] {
    return [...this.shelves];
  }

  public getLists(): CuratedList[] {
    return [...this.lists];
  }

  public getCurrentUser(): User | null {
    if (!this.currentUserId) return null;
    const user = this.users.find((u) => u.id === this.currentUserId);
    return user || null;
  }

  public getFirebaseStatus(): boolean {
    return this.isFirebaseConnected;
  }

  // User Actions
  public setCurrentUser(userId: string | null) {
    this.currentUserId = userId;
    if (userId) {
      localStorage.setItem(KEYS.CURRENT_USER_ID, userId);
    } else {
      localStorage.setItem(KEYS.CURRENT_USER_ID, 'guest');
    }
    this.notify();
  }

  public logout() {
    this.currentUserId = null;
    localStorage.setItem(KEYS.CURRENT_USER_ID, 'guest');
    this.notify();
  }

  public loginWithGoogleData(googleUser: {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string | null;
  }): { matchedUser: User | null } {
    const emailNorm = (googleUser.email || '').toLowerCase().trim();
    
    // Look up by googleUid or email
    let matched = this.users.find(
      (u) =>
        (u.googleUid && u.googleUid === googleUser.uid) ||
        (u.email && u.email.toLowerCase() === emailNorm)
    );

    if (matched) {
      if (!matched.googleUid) {
        matched.googleUid = googleUser.uid;
      }
      if (googleUser.photoURL && !matched.avatarUrl) {
        matched.avatarUrl = googleUser.photoURL;
      }
      this.currentUserId = matched.id;
      localStorage.setItem(KEYS.CURRENT_USER_ID, matched.id);
      this.persistAndNotify('users', this.users);
      return { matchedUser: matched };
    }

    return { matchedUser: null };
  }

  public registerUser(user: Omit<User, 'id' | 'createdAt'>): User {
    // Enforce max 150 words bio
    const words = countWords(user.bio);
    if (words > 150) {
      throw new Error(`Author bio cannot exceed 150 words (currently ${words} words).`);
    }

    const newUser: User = {
      ...user,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.currentUserId = newUser.id;
    localStorage.setItem(KEYS.CURRENT_USER_ID, newUser.id);
    this.persistAndNotify('users', this.users);
    return newUser;
  }

  public updateUserProfile(userId: string, updates: Partial<User>) {
    const index = this.users.findIndex((u) => u.id === userId);
    if (index === -1) return;

    if (updates.bio !== undefined) {
      const words = countWords(updates.bio);
      if (words > 150) {
        throw new Error(`Author bio cannot exceed 150 words (currently ${words} words).`);
      }
    }

    this.users[index] = { ...this.users[index], ...updates };
    this.persistAndNotify('users', this.users);
  }

  // Book Actions
  public addBook(
    bookData: Omit<Book, 'id' | 'createdAt' | 'viewsCount' | 'authorName' | 'authorAvatar'>
  ): Book {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'author') {
      throw new Error('Only registered authors can add books.');
    }

    if (!isValidImageUrl(bookData.coverUrl)) {
      throw new Error('Please provide a valid image HTTP/HTTPS URL for the book cover.');
    }

    const newBook: Book = {
      ...bookData,
      id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatarUrl,
      viewsCount: 1,
      createdAt: new Date().toISOString(),
    };

    this.books.unshift(newBook);
    this.persistAndNotify('books', this.books);
    return newBook;
  }

  public updateBook(bookId: string, updates: Partial<Book>) {
    const index = this.books.findIndex((b) => b.id === bookId);
    if (index === -1) return;

    if (updates.coverUrl && !isValidImageUrl(updates.coverUrl)) {
      throw new Error('Please provide a valid image HTTP/HTTPS URL for the book cover.');
    }

    this.books[index] = { ...this.books[index], ...updates };
    this.persistAndNotify('books', this.books);
  }

  public deleteBook(bookId: string) {
    this.books = this.books.filter((b) => b.id !== bookId);
    this.reviews = this.reviews.filter((r) => r.bookId !== bookId);
    this.shelves = this.shelves.filter((s) => s.bookId !== bookId);
    this.questions = this.questions.filter((q) => q.bookId !== bookId);
    this.persistAndNotify('books', this.books);
  }

  public incrementBookViews(bookId: string) {
    const book = this.books.find((b) => b.id === bookId);
    if (book) {
      book.viewsCount = (book.viewsCount || 0) + 1;
      this.saveLocal(KEYS.BOOKS, this.books);
      this.notify();
    }
  }

  // Review & Rating Actions
  public addReview(bookId: string, rating: number, comment: string): Review {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('Please sign in with Google to post a review.');
    const newReview: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      bookId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      rating: Math.min(5, Math.max(1, rating)),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    this.reviews.unshift(newReview);
    this.persistAndNotify('reviews', this.reviews);
    return newReview;
  }

  // Shelf Actions
  public setShelfStatus(bookId: string, status: ShelfStatus | 'remove') {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('Please sign in with Google to organize your reading shelf.');
    const existingIndex = this.shelves.findIndex(
      (s) => s.userId === currentUser.id && s.bookId === bookId
    );

    if (status === 'remove') {
      if (existingIndex !== -1) {
        this.shelves.splice(existingIndex, 1);
        this.persistAndNotify('shelves', this.shelves);
      }
      return;
    }

    if (existingIndex !== -1) {
      this.shelves[existingIndex].status = status;
      this.shelves[existingIndex].updatedAt = new Date().toISOString();
    } else {
      this.shelves.push({
        id: `shelf-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        userId: currentUser.id,
        bookId,
        status,
        updatedAt: new Date().toISOString(),
      });
    }

    this.persistAndNotify('shelves', this.shelves);
  }

  // Questions Actions
  public askQuestion(authorId: string, questionText: string, bookId?: string): Question {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('Please sign in with Google to ask an author a question.');
    const book = bookId ? this.books.find((b) => b.id === bookId) : undefined;

    const newQuestion: Question = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      authorId,
      bookId,
      bookTitle: book?.title,
      askerId: currentUser.id,
      askerName: currentUser.name,
      askerAvatar: currentUser.avatarUrl,
      questionText: questionText.trim(),
      createdAt: new Date().toISOString(),
    };

    this.questions.unshift(newQuestion);
    this.persistAndNotify('questions', this.questions);
    return newQuestion;
  }

  public answerQuestion(questionId: string, answerText: string) {
    const index = this.questions.findIndex((q) => q.id === questionId);
    if (index === -1) return;

    this.questions[index].answerText = answerText.trim();
    this.questions[index].answeredAt = new Date().toISOString();
    this.persistAndNotify('questions', this.questions);
  }

  // Curated Lists Actions
  public createCuratedList(title: string, description: string, bookIds: string[]): CuratedList {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('Please sign in with Google to create a curated list.');
    const newList: CuratedList = {
      id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorAvatar: currentUser.avatarUrl,
      title: title.trim(),
      description: description.trim(),
      bookIds,
      likesCount: 0,
      likedByUserIds: [],
      createdAt: new Date().toISOString(),
    };

    this.lists.unshift(newList);
    this.persistAndNotify('lists', this.lists);
    return newList;
  }

  public toggleLikeList(listId: string) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('Please sign in to upvote reading lists.');
    const list = this.lists.find((l) => l.id === listId);
    if (!list) return;

    const liked = list.likedByUserIds.includes(currentUser.id);
    if (liked) {
      list.likedByUserIds = list.likedByUserIds.filter((id) => id !== currentUser.id);
      list.likesCount = Math.max(0, list.likesCount - 1);
    } else {
      list.likedByUserIds.push(currentUser.id);
      list.likesCount = (list.likesCount || 0) + 1;
    }

    this.persistAndNotify('lists', this.lists);
  }

  // Reset to default seed data
  public resetToInitialSeed() {
    this.users = [...INITIAL_AUTHORS, ...INITIAL_READERS];
    this.books = [...INITIAL_BOOKS];
    this.reviews = [...INITIAL_REVIEWS];
    this.questions = [...INITIAL_QUESTIONS];
    this.shelves = [...INITIAL_SHELF_ITEMS];
    this.lists = [...INITIAL_CURATED_LISTS];
    this.currentUserId = 'mason-carter';
    this.persistAndNotify('reset', true);
  }
}

export const storage = new StorageEngine();
