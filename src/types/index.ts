export type UserRole = 'author' | 'reader';

export type ShelfStatus = 'want_to_read' | 'reading' | 'finished';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  bio: string; // Strictly max 150 words
  websiteUrl?: string;
  socialUrl?: string;
  penName?: string;
  isMasonCarter?: boolean;
  googleUid?: string;
  createdAt: string;
}

export interface Book {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  subtitle?: string;
  genre: string;
  tags: string[];
  synopsis: string;
  coverUrl: string; // External Image URL only (no file uploads)
  purchaseUrl: string; // Direct purchase link (Amazon, Bookshop, Gumroad, etc.)
  purchaseRetailerName: string; // e.g. "Bookshop.org", "Amazon", "Author Webshop"
  pageCount: number;
  publishedYear: number;
  createdAt: string;
  viewsCount: number;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface Question {
  id: string;
  authorId: string;
  bookId?: string;
  bookTitle?: string;
  askerId: string;
  askerName: string;
  askerAvatar: string;
  questionText: string;
  answerText?: string;
  answeredAt?: string;
  createdAt: string;
}

export interface ShelfItem {
  id: string;
  userId: string;
  bookId: string;
  status: ShelfStatus;
  updatedAt: string;
}

export interface CuratedList {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  title: string;
  description: string;
  bookIds: string[];
  likesCount: number;
  likedByUserIds: string[];
  createdAt: string;
}

export interface FirebaseConnectionConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  enabled: boolean;
}
