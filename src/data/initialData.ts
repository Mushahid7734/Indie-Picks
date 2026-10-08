import { User, Book, Review, Question, CuratedList, ShelfItem, ADMIN_EMAIL } from '../types';

export const INITIAL_AUTHORS: User[] = [
  {
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
    bio: 'Independent author and founder of Indie Picks. Dedicated to bringing authentic, self-published voices directly to readers with zero paywalls and complete creative freedom.',
    websiteUrl: 'https://mushahid7734.github.io',
    socialUrl: 'https://twitter.com/masoncarter',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_READERS: User[] = [];

export const INITIAL_BOOKS: Book[] = [];

export const INITIAL_REVIEWS: Review[] = [];

export const INITIAL_QUESTIONS: Question[] = [];

export const INITIAL_SHELF_ITEMS: ShelfItem[] = [];

export const INITIAL_CURATED_LISTS: CuratedList[] = [];
