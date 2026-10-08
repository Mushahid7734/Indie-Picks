import {
  User,
  Book,
  Review,
  Question,
  CuratedList,
  ShelfItem,
  ShelfStatus,
  ActiveMode,
  UserRole,
  ADMIN_EMAIL,
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
import { syncAllToIndexedDB, loadAllFromIndexedDB } from './indexedDB';
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

  private async init() {
    if (typeof window === 'undefined') return;

    // 1. Try loading from IndexedDB first for fast offline sync
    try {
      const idbData = await loadAllFromIndexedDB();
      if (idbData && idbData.users.length > 0) {
        this.users = idbData.users;
        this.books = idbData.books;
        this.reviews = idbData.reviews;
        this.questions = idbData.questions;
        this.shelves = idbData.shelves;
        this.lists = idbData.lists;
      } else {
        this.reloadFromLocalStorage();
      }
    } catch {
      this.reloadFromLocalStorage();
    }

    // Ensure Mason Carter exists with admin email
    this.ensureMasonCarter();

    // Clean out any old mock artifacts if they exist from development
    const hasTestArtifacts =
      this.users.some((u) => u.id === 'reader-clara' || u.id === 'author-elena' || u.name === 'Elena Vance' || u.name === 'Marcus Thorne') ||
      this.books.some((b) => b.id.startsWith('book-1') || b.id.startsWith('book-2') || b.authorName === 'Elena Vance');

    if (hasTestArtifacts) {
      this.users = this.users.filter(
        (u) => u.id === 'mason-carter' || u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() || u.googleUid
      );
      this.books = this.books.filter(
        (b) => !b.id.startsWith('book-1') && !b.id.startsWith('book-2') && b.authorName !== 'Elena Vance' && b.authorName !== 'Marcus Thorne'
      );
      this.reviews = [];
      this.questions = [];
      this.shelves = [];
      this.lists = [];
      this.saveLocal(KEYS.USERS, this.users);
      this.saveLocal(KEYS.BOOKS, this.books);
      this.saveLocal(KEYS.REVIEWS, this.reviews);
      this.saveLocal(KEYS.QUESTIONS, this.questions);
      this.saveLocal(KEYS.SHELVES, this.shelves);
      this.saveLocal(KEYS.LISTS, this.lists);
      syncAllToIndexedDB({
        books: this.books,
        users: this.users,
        reviews: this.reviews,
        questions: this.questions,
        shelves: this.shelves,
        lists: this.lists,
      });
    }

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

    // 3. Connect Firebase Realtime Database
    this.connectFirebase();
  }

  private reloadFromLocalStorage() {
    this.users = this.loadLocal(KEYS.USERS, [...INITIAL_AUTHORS, ...INITIAL_READERS]);
    this.books = this.loadLocal(KEYS.BOOKS, INITIAL_BOOKS);
    this.reviews = this.loadLocal(KEYS.REVIEWS, INITIAL_REVIEWS);
    this.questions = this.loadLocal(KEYS.QUESTIONS, INITIAL_QUESTIONS);
    this.shelves = this.loadLocal(KEYS.SHELVES, INITIAL_SHELF_ITEMS);
    this.lists = this.loadLocal(KEYS.LISTS, INITIAL_CURATED_LISTS);
  }

  private ensureMasonCarter() {
    const mason = this.users.find((u) => u.id === 'mason-carter' || u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    if (mason) {
      mason.email = ADMIN_EMAIL;
      mason.isAdmin = true;
      mason.isAuthor = true;
      mason.isMasonCarter = true;
      mason.role = 'admin';
      if (!mason.activeMode) mason.activeMode = 'author';
    } else {
      this.users.unshift({
        id: 'mason-carter',
        name: 'Mason Carter',
        email: ADMIN_EMAIL,
        role: 'admin',
        isAdmin: true,
        isAuthor: true,
        activeMode: 'author',
        isMasonCarter: true,
        penName: 'Mason Carter',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Independent author and founder of Indie Picks. Writing stories and creating a clean, free home for independent voices and avid readers.',
        websiteUrl: 'https://mushahid7734.github.io',
        createdAt: new Date().toISOString(),
      });
    }
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
    this.reloadFromLocalStorage();
    this.ensureMasonCarter();
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

            this.ensureMasonCarter();

            // Cache in LocalStorage & IndexedDB
            this.saveLocal(KEYS.BOOKS, this.books);
            this.saveLocal(KEYS.REVIEWS, this.reviews);
            this.saveLocal(KEYS.QUESTIONS, this.questions);
            this.saveLocal(KEYS.LISTS, this.lists);
            this.saveLocal(KEYS.SHELVES, this.shelves);
            this.saveLocal(KEYS.USERS, this.users);

            syncAllToIndexedDB({
              books: this.books,
              users: this.users,
              reviews: this.reviews,
              questions: this.questions,
              shelves: this.shelves,
              lists: this.lists,
            });

            this.notify();
          } else {
            // First time Firebase sync
            set(rootRef, {
              books: this.books,
              reviews: this.reviews,
              questions: this.questions,
              lists: this.lists,
              shelves: this.shelves,
              users: this.users,
            }).catch((e) => console.warn('Firebase initial sync notice', e));
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
    // 1. Save to LocalStorage
    this.saveLocal(KEYS.USERS, this.users);
    this.saveLocal(KEYS.BOOKS, this.books);
    this.saveLocal(KEYS.REVIEWS, this.reviews);
    this.saveLocal(KEYS.QUESTIONS, this.questions);
    this.saveLocal(KEYS.SHELVES, this.shelves);
    this.saveLocal(KEYS.LISTS, this.lists);

    // 2. Sync to IndexedDB for complete offline integrity
    syncAllToIndexedDB({
      books: this.books,
      users: this.users,
      reviews: this.reviews,
      questions: this.questions,
      shelves: this.shelves,
      lists: this.lists,
    });

    // 3. Broadcast to other open browser tabs
    try {
      this.broadcastChannel?.postMessage({ type: 'REFRESH_DATA' });
    } catch {
      // Ignore
    }

    // 4. Sync to Firebase
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

  // User & Mode Switching
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

  public switchActiveMode(mode: ActiveMode) {
    const user = this.getCurrentUser();
    if (!user) return;

    if (mode === 'admin' && !user.isAdmin) {
      throw new Error('Only the site administrator can access Admin Mode.');
    }

    if (mode === 'author' && !user.isAuthor && !user.isAdmin) {
      throw new Error('Please register an author profile before switching to Author Mode.');
    }

    user.activeMode = mode;
    this.persistAndNotify('users', this.users);
  }

  public upgradeReaderToAuthor(penName: string, bio: string, websiteUrl?: string) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Please sign in first.');

    const words = countWords(bio);
    if (words > 150) {
      throw new Error(`Author bio cannot exceed 150 words (currently ${words} words).`);
    }

    user.isAuthor = true;
    user.role = 'author';
    user.penName = penName.trim() || user.name;
    user.bio = bio.trim();
    user.websiteUrl = websiteUrl?.trim();
    user.activeMode = 'author';

    this.persistAndNotify('users', this.users);
  }

  public loginWithGoogleData(googleUser: {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string | null;
  }): { matchedUser: User | null } {
    const emailNorm = (googleUser.email || '').toLowerCase().trim();
    
    // Check if this is the admin (Mason Carter)
    const isAdmin = emailNorm === ADMIN_EMAIL.toLowerCase();

    let matched = this.users.find(
      (u) =>
        (u.googleUid && u.googleUid === googleUser.uid) ||
        (u.email && u.email.toLowerCase() === emailNorm)
    );

    if (matched) {
      matched.googleUid = googleUser.uid;
      if (isAdmin) {
        matched.isAdmin = true;
        matched.isAuthor = true;
        matched.isMasonCarter = true;
        matched.role = 'admin';
        matched.name = 'Mason Carter';
      }
      this.currentUserId = matched.id;
      localStorage.setItem(KEYS.CURRENT_USER_ID, matched.id);
      this.persistAndNotify('users', this.users);
      return { matchedUser: matched };
    }

    // If logging in with the Admin email for the first time
    if (isAdmin) {
      const mason = this.users.find((u) => u.id === 'mason-carter');
      if (mason) {
        mason.googleUid = googleUser.uid;
        this.currentUserId = mason.id;
        localStorage.setItem(KEYS.CURRENT_USER_ID, mason.id);
        this.persistAndNotify('users', this.users);
        return { matchedUser: mason };
      }
    }

    return { matchedUser: null };
  }

  public registerUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const words = countWords(user.bio);
    if (words > 150) {
      throw new Error(`Bio cannot exceed 150 words (currently ${words} words).`);
    }

    const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    const newUser: User = {
      ...user,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      isAdmin,
      isAuthor: user.role === 'author' || isAdmin,
      activeMode: user.role === 'author' ? 'author' : 'reader',
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
        throw new Error(`Bio cannot exceed 150 words (currently ${words} words).`);
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
    if (!currentUser || (!currentUser.isAuthor && !currentUser.isAdmin)) {
      throw new Error('Only registered authors can enlist books.');
    }

    if (!isValidImageUrl(bookData.coverUrl)) {
      throw new Error('Please provide a valid image HTTP/HTTPS URL for the book cover.');
    }

    const newBook: Book = {
      ...bookData,
      id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      authorId: currentUser.id,
      authorName: currentUser.penName || currentUser.name,
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

    if (status === 'reading') {
      // Validate: Max 3 books allowed in reading status at one time
      const currentReadingCount = this.shelves.filter(
        (s) => s.userId === currentUser.id && s.status === 'reading' && s.bookId !== bookId
      ).length;
      if (currentReadingCount >= 3) {
        throw new Error('A maximum of 3 books in reading progress are allowed simultaneously.');
      }
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

  /**
   * Update reading progress for a book:
   * - One status note & page number per book (updating the existing entry)
   * - Max 200 words allowed for reading progress notes
   */
  public updateReadingProgress(bookId: string, progressPage: number, progressStatus: string) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('Please sign in with Google to update reading progress.');

    const wordCount = countWords(progressStatus);
    if (wordCount > 200) {
      throw new Error(`Reading progress note cannot exceed 200 words (currently ${wordCount} words).`);
    }

    let existingIndex = this.shelves.findIndex(
      (s) => s.userId === currentUser.id && s.bookId === bookId
    );

    const now = new Date().toISOString();

    if (existingIndex !== -1) {
      // If moving or confirming status
      if (this.shelves[existingIndex].status !== 'reading') {
        // Check reading books limit
        const currentReadingCount = this.shelves.filter(
          (s) => s.userId === currentUser.id && s.status === 'reading' && s.bookId !== bookId
        ).length;
        if (currentReadingCount >= 3) {
          throw new Error('A maximum of 3 books in reading progress are allowed simultaneously.');
        }
        this.shelves[existingIndex].status = 'reading';
      }
      this.shelves[existingIndex].progressPage = Math.max(0, Math.floor(progressPage));
      this.shelves[existingIndex].progressStatus = progressStatus.trim();
      this.shelves[existingIndex].progressUpdatedAt = now;
      this.shelves[existingIndex].updatedAt = now;
    } else {
      // Check reading limit
      const currentReadingCount = this.shelves.filter(
        (s) => s.userId === currentUser.id && s.status === 'reading'
      ).length;
      if (currentReadingCount >= 3) {
        throw new Error('A maximum of 3 books in reading progress are allowed simultaneously.');
      }

      this.shelves.push({
        id: `shelf-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        userId: currentUser.id,
        bookId,
        status: 'reading',
        progressPage: Math.max(0, Math.floor(progressPage)),
        progressStatus: progressStatus.trim(),
        progressUpdatedAt: now,
        updatedAt: now,
      });
    }

    this.persistAndNotify('shelves', this.shelves);
  }

  /**
   * Follow / Unfollow another user (author or reader)
   */
  public toggleFollowUser(targetUserId: string) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error('Please sign in with Google to follow users.');
    if (currentUser.id === targetUserId) {
      throw new Error('You cannot follow yourself.');
    }

    const currentFollowing = currentUser.followingUserIds || [];
    const isFollowing = currentFollowing.includes(targetUserId);

    // Update current user's following list
    if (isFollowing) {
      currentUser.followingUserIds = currentFollowing.filter((id) => id !== targetUserId);
    } else {
      currentUser.followingUserIds = [...currentFollowing, targetUserId];
    }

    // Update target user's followerCount
    const targetUser = this.users.find((u) => u.id === targetUserId);
    if (targetUser) {
      const delta = isFollowing ? -1 : 1;
      targetUser.followerCount = Math.max(0, (targetUser.followerCount || 0) + delta);
    }

    this.persistAndNotify('users', this.users);
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

  // --- ADMIN MODERATION PANEL METHODS ---
  public verifyAdmin() {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.isAdmin) {
      throw new Error('Access denied: Administrator privileges required.');
    }
  }

  public adminDeleteBook(bookId: string) {
    this.verifyAdmin();
    this.deleteBook(bookId);
  }

  public adminDeleteUser(userId: string) {
    this.verifyAdmin();
    if (userId === 'mason-carter') throw new Error('Cannot delete primary administrator.');
    this.users = this.users.filter((u) => u.id !== userId);
    this.books = this.books.filter((b) => b.authorId !== userId);
    this.reviews = this.reviews.filter((r) => r.userId !== userId);
    this.questions = this.questions.filter((q) => q.askerId !== userId);
    this.lists = this.lists.filter((l) => l.creatorId !== userId);
    this.persistAndNotify('users', this.users);
  }

  public adminDeleteReview(reviewId: string) {
    this.verifyAdmin();
    this.reviews = this.reviews.filter((r) => r.id !== reviewId);
    this.persistAndNotify('reviews', this.reviews);
  }

  public adminDeleteQuestion(questionId: string) {
    this.verifyAdmin();
    this.questions = this.questions.filter((q) => q.id !== questionId);
    this.persistAndNotify('questions', this.questions);
  }

  public adminDeleteCuratedList(listId: string) {
    this.verifyAdmin();
    this.lists = this.lists.filter((l) => l.id !== listId);
    this.persistAndNotify('lists', this.lists);
  }

  public adminUpdateUserRole(userId: string, newRole: UserRole) {
    this.verifyAdmin();
    const target = this.users.find((u) => u.id === userId);
    if (!target) return;
    target.role = newRole;
    target.isAuthor = newRole === 'author' || newRole === 'admin';
    this.persistAndNotify('users', this.users);
  }

  // Clean reset to Mason Carter only
  public resetToCleanState() {
    this.users = [...INITIAL_AUTHORS];
    this.books = [];
    this.reviews = [];
    this.questions = [];
    this.shelves = [];
    this.lists = [];
    this.currentUserId = 'mason-carter';
    this.persistAndNotify('reset', true);
  }
}

export const storage = new StorageEngine();
