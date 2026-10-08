import { Book, Review, ShelfItem, CuratedList } from '../types';

export interface BookStats {
  bookId: string;
  reviewsCount: number;
  averageRating: number;
  ratingDistribution: { [star: number]: number };
  shelvesCount: number;
  wantToReadCount: number;
  readingCount: number;
  finishedCount: number;
  popularityScore: number;
}

/**
 * Computes live metrics for any book from reviews and shelves
 */
export function calculateBookStats(
  book: Book,
  reviews: Review[],
  shelfItems: ShelfItem[]
): BookStats {
  const bookReviews = reviews.filter((r) => r.bookId === book.id);
  const bookShelves = shelfItems.filter((s) => s.bookId === book.id);

  const reviewsCount = bookReviews.length;
  let totalRating = 0;
  const ratingDistribution: { [star: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  bookReviews.forEach((r) => {
    totalRating += r.rating;
    const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
    ratingDistribution[rounded] = (ratingDistribution[rounded] || 0) + 1;
  });

  const averageRating = reviewsCount > 0 ? Number((totalRating / reviewsCount).toFixed(1)) : 0;

  const wantToReadCount = bookShelves.filter((s) => s.status === 'want_to_read').length;
  const readingCount = bookShelves.filter((s) => s.status === 'reading').length;
  const finishedCount = bookShelves.filter((s) => s.status === 'finished').length;
  const shelvesCount = bookShelves.length;

  // Weighted popularity formula prioritizing user community engagement (reviews, ratings, shelves)
  const popularityScore =
    reviewsCount * 30 +
    averageRating * 20 +
    shelvesCount * 12 +
    (book.viewsCount || 0) * 0.02;

  return {
    bookId: book.id,
    reviewsCount,
    averageRating,
    ratingDistribution,
    shelvesCount,
    wantToReadCount,
    readingCount,
    finishedCount,
    popularityScore,
  };
}

/**
 * Helper to get a stable integer hash from a string seed
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Current ISO week number
 */
export function getISOWeek(date = new Date()): { week: number; year: number } {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return { week: weekNumber, year: date.getFullYear() };
}

/**
 * Book of the Week:
 * "a book with most reviews, comments, ratings, gets picked automatically as book of the week"
 */
export function getBookOfTheWeek(
  books: Book[],
  reviews: Review[],
  shelfItems: ShelfItem[]
): Book | null {
  if (!books.length) return null;

  const scored = books.map((b) => {
    const stats = calculateBookStats(b, reviews, shelfItems);
    // Explicit community weight: reviews count, comments length, ratings
    const score =
      stats.reviewsCount * 45 +
      stats.averageRating * 30 +
      stats.shelvesCount * 15 +
      (b.viewsCount || 0) * 0.01;
    return { book: b, score, stats };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.book || books[0];
}

/**
 * Pick of the Day:
 * Deterministically selected per calendar day among top engaging books
 */
export function getPickOfTheDay(
  books: Book[],
  reviews: Review[],
  shelfItems: ShelfItem[],
  date = new Date()
): Book | null {
  if (!books.length) return null;
  const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const seed = hashString(dayKey);

  // Filter top books by popularity
  const sorted = [...books].sort((a, b) => {
    const statsA = calculateBookStats(a, reviews, shelfItems);
    const statsB = calculateBookStats(b, reviews, shelfItems);
    return statsB.popularityScore - statsA.popularityScore;
  });

  // Pick deterministically using hash
  const index = seed % sorted.length;
  return sorted[index];
}

/**
 * Pick of the Month:
 * Highest engagement indie book for the month
 */
export function getPickOfTheMonth(
  books: Book[],
  reviews: Review[],
  shelfItems: ShelfItem[],
  date = new Date()
): Book | null {
  if (!books.length) return null;
  const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
  const seed = hashString(monthKey);

  const sorted = [...books].sort((a, b) => {
    const statsA = calculateBookStats(a, reviews, shelfItems);
    const statsB = calculateBookStats(b, reviews, shelfItems);
    return statsB.popularityScore - statsA.popularityScore;
  });

  const pool = sorted.slice(0, Math.min(6, sorted.length));
  return pool[seed % pool.length];
}

/**
 * Pick of the Year:
 * The crown jewel indie pick of the year with highest rating and strong community support
 */
export function getPickOfTheYear(
  books: Book[],
  reviews: Review[],
  shelfItems: ShelfItem[],
  date = new Date()
): Book | null {
  if (!books.length) return null;
  const yearKey = `${date.getFullYear()}`;
  const seed = hashString(yearKey);

  const scored = books.map((b) => {
    const stats = calculateBookStats(b, reviews, shelfItems);
    const yearScore = (stats.averageRating >= 4.0 ? stats.averageRating * 50 : 0) + stats.reviewsCount * 25 + stats.shelvesCount * 10;
    return { book: b, score: yearScore };
  });

  scored.sort((a, b) => b.score - a.score);
  const topTier = scored.slice(0, Math.min(4, scored.length));
  return topTier[seed % topTier.length]?.book || books[0];
}

/**
 * Automatically 10 books picked every week by JavaScript as featured books
 */
export function getFeatured10BooksOfWeek(
  books: Book[],
  reviews: Review[],
  shelfItems: ShelfItem[],
  date = new Date()
): Book[] {
  if (!books.length) return [];
  if (books.length <= 10) return [...books];

  const { week, year } = getISOWeek(date);
  const weekSeed = hashString(`week-${year}-${week}`);

  // Sort by base quality & author diversity
  const scored = books.map((b) => {
    const stats = calculateBookStats(b, reviews, shelfItems);
    return { book: b, score: stats.popularityScore };
  });

  scored.sort((a, b) => b.score - a.score);

  // Deterministic shuffle rotation based on weekSeed
  const shuffled = [...scored];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (weekSeed + i * 17) % (i + 1);
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  return shuffled.slice(0, 10).map((s) => s.book);
}

/**
 * Popular reader-curated lists for display in Explore tab
 */
export function getPopularReaderLists(lists: CuratedList[]): CuratedList[] {
  return [...lists]
    .filter((l) => l.bookIds && l.bookIds.length > 0)
    .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
}

/**
 * Group books by genres
 */
export function groupBooksByGenre(books: Book[]): { genre: string; count: number; books: Book[] }[] {
  const genreMap = new Map<string, Book[]>();

  books.forEach((b) => {
    const g = b.genre || 'Uncategorized';
    if (!genreMap.has(g)) {
      genreMap.set(g, []);
    }
    genreMap.get(g)!.push(b);
  });

  const result: { genre: string; count: number; books: Book[] }[] = [];
  genreMap.forEach((genreBooks, genre) => {
    result.push({
      genre,
      count: genreBooks.length,
      books: genreBooks,
    });
  });

  return result.sort((a, b) => b.count - a.count);
}
