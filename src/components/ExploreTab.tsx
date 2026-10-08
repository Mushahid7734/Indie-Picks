import React, { useState } from 'react';
import { Book, Review, ShelfItem, ShelfStatus, CuratedList, User } from '../types';
import { BookCard } from './BookCard';
import {
  getBookOfTheWeek,
  getPickOfTheDay,
  getPickOfTheMonth,
  getPickOfTheYear,
  getFeatured10BooksOfWeek,
  getPopularReaderLists,
  groupBooksByGenre,
  getISOWeek,
  calculateBookStats,
} from '../lib/picksEngine';
import {
  Sparkles,
  Trophy,
  Calendar,
  Star,
  ExternalLink,
  Bookmark,
  Heart,
  ChevronRight,
  Flame,
  Clock,
  Compass,
  Feather,
  PlusCircle,
  Award,
  BookOpen,
  Users,
  Shuffle,
  LogIn,
} from 'lucide-react';

interface ExploreTabProps {
  books: Book[];
  reviews: Review[];
  shelves: ShelfItem[];
  curatedLists: CuratedList[];
  currentUser: User;
  allUsers?: User[];
  featuredAuthor?: User;
  onSelectBook: (book: Book) => void;
  onSelectAuthor: (authorId: string) => void;
  onShelfChange: (bookId: string, status: ShelfStatus | 'remove') => void;
  onToggleLikeList: (listId: string) => void;
  onOpenAuthorDashboard?: () => void;
  onOpenAuthModal?: () => void;
}

export const ExploreTab: React.FC<ExploreTabProps> = ({
  books,
  reviews,
  shelves,
  curatedLists,
  currentUser,
  allUsers = [],
  featuredAuthor,
  onSelectBook,
  onSelectAuthor,
  onShelfChange,
  onToggleLikeList,
  onOpenAuthorDashboard,
  onOpenAuthModal,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Algorithmic & dynamic featured picks
  const bookOfTheWeek = getBookOfTheWeek(books, reviews, shelves);
  const pickOfTheDay = getPickOfTheDay(books, reviews, shelves);
  const pickOfTheMonth = getPickOfTheMonth(books, reviews, shelves);
  const pickOfTheYear = getPickOfTheYear(books, reviews, shelves);
  // Dynamically / randomly picks up to 15 featured books
  const weekly10Books = getFeatured10BooksOfWeek(books, reviews, shelves, new Date(), 15);
  const popularLists = getPopularReaderLists(curatedLists).slice(0, 4);
  const genreGroups = groupBooksByGenre(books);
  const { week, year } = getISOWeek();

  // Recently added books (newest first)
  const recentlyAddedBooks = [...books]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  // Community members stats
  const totalUsersCount = allUsers.length;
  const authorsCount = allUsers.filter((u) => u.isAuthor || u.role === 'author' || u.role === 'admin').length;
  const readersCount = allUsers.filter((u) => !u.isAuthor && u.role === 'reader').length;
  const sampleUsers = allUsers.slice(0, 6);

  // Book of the Week Stats
  const botwStats = bookOfTheWeek ? calculateBookStats(bookOfTheWeek, reviews, shelves) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-16 animate-fade-in">
      {/* 1. FEATURED AUTHOR BANNER (Mason Carter) */}
      {featuredAuthor && (
        <section className="relative overflow-hidden rounded-3xl border border-[#D5C9B3] bg-gradient-to-r from-[#F6F1E6] via-[#FAF7F1] to-[#F1EAD9] p-6 sm:p-8 shadow-xs">
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="relative flex-shrink-0">
                <img
                  src={featuredAuthor.avatarUrl}
                  alt={featuredAuthor.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-[#D8CFBF] book-shadow"
                />
                <div className="absolute -bottom-1 -right-1 rounded-full bg-[#2C2621] p-1 text-[#D99B3B] shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1 rounded bg-[#D99B3B]/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#8C5D17]">
                    <Award className="w-3 h-3" />
                    Featured Author & Founder
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2621] mt-1.5">
                  {featuredAuthor.name}
                </h2>
                <p className="font-serif text-xs text-[#5C4F42] leading-relaxed max-w-xl mt-2">
                  "{featuredAuthor.bio}"
                </p>
                <div className="mt-3 flex items-center justify-center sm:justify-start gap-3 text-xs text-[#7A6F64]">
                  <span className="font-medium text-[#2C2621]">
                    {books.filter((b) => b.authorId === featuredAuthor.id).length} Books Enlisted
                  </span>
                  <span>·</span>
                  <a
                    href={featuredAuthor.websiteUrl || 'https://mushahid7734.github.io'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8C5D17] hover:underline"
                  >
                    Official Site
                  </a>
                </div>
              </div>
            </div>

            {/* Actions for Mason Carter or Readers */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => onSelectAuthor(featuredAuthor.id)}
                className="rounded-xl bg-[#2C2621] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] hover:bg-[#3E362F] transition shadow-xs text-center flex items-center justify-center gap-1.5"
              >
                <Feather className="w-3.5 h-3.5 text-[#D99B3B]" />
                <span>View Author Profile</span>
              </button>

              {(currentUser.id === featuredAuthor.id || currentUser.isAdmin || currentUser.isAuthor) && onOpenAuthorDashboard && (
                <button
                  onClick={onOpenAuthorDashboard}
                  className="rounded-xl border border-[#D5B876] bg-[#FAF8F5] px-4 py-2.5 text-xs font-semibold text-[#7A5418] hover:bg-white transition flex items-center justify-center gap-1.5 shadow-xs text-center"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#B2741E]" />
                  <span>Enlist New Book</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* COMMUNITY SANCTUARY STATS WIDGET (Users & Authors Joined) */}
      <section className="rounded-2xl border border-[#E5DEC9] bg-[#FAF8F5] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#EAE2D2] text-[#8C5D17] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                <span className="font-serif text-lg font-bold text-[#2C2621]">
                  Growing Literary Sanctuary
                </span>
                <span className="text-[11px] font-semibold bg-[#EAE2D2] text-[#8C5D17] px-2 py-0.5 rounded-full">
                  Live Community
                </span>
              </div>
              <p className="text-xs text-[#6B5E51] mt-0.5">
                Join independent readers and self-published authors connecting with zero algorithms or paywalls.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 flex-wrap justify-center md:justify-end">
            {/* Small Profile Icons Stack */}
            <div className="flex items-center">
              <div className="flex -space-x-2.5 overflow-hidden py-1">
                {sampleUsers.map((u) => (
                  <img
                    key={u.id}
                    src={u.avatarUrl}
                    alt={u.name}
                    title={`${u.name} (${u.isAuthor ? 'Author' : 'Reader'})`}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-[#FAF8F5] object-cover cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => u.isAuthor && onSelectAuthor(u.id)}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-[#8C5D17] ml-3 whitespace-nowrap">
                {Math.max(1, totalUsersCount)} {totalUsersCount === 1 ? 'member' : 'members'}
              </span>
            </div>

            {/* Counts breakdown */}
            <div className="flex items-center gap-3 text-xs text-[#5C4F42] border-l border-[#DDD5C5] pl-4">
              <div>
                <span className="font-bold text-[#2C2621] block leading-tight">
                  {Math.max(1, authorsCount)}
                </span>
                <span className="text-[10px] text-[#7A6F64] uppercase font-semibold">
                  {authorsCount === 1 ? 'Author' : 'Authors'}
                </span>
              </div>
              <span className="text-[#C5BBA9]">·</span>
              <div>
                <span className="font-bold text-[#2C2621] block leading-tight">
                  {readersCount}
                </span>
                <span className="text-[10px] text-[#7A6F64] uppercase font-semibold">
                  {readersCount === 1 ? 'Reader' : 'Readers'}
                </span>
              </div>
              <span className="text-[#C5BBA9]">·</span>
              <div>
                <span className="font-bold text-[#2C2621] block leading-tight">
                  {books.length}
                </span>
                <span className="text-[10px] text-[#7A6F64] uppercase font-semibold">
                  {books.length === 1 ? 'Book' : 'Books'}
                </span>
              </div>
            </div>

            {!currentUser?.googleUid && onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="rounded-xl bg-[#2C2621] px-4 py-2 text-xs font-semibold text-[#FAF8F5] hover:bg-[#3E362F] transition shadow-xs flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-[#D99B3B]" />
                <span>Join Community</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* When Catalogue is Empty, Show Author Encouragement Banner */}
      {books.length === 0 && (
        <section className="rounded-3xl border border-dashed border-[#D5C9B3] bg-[#FAF8F5] p-8 sm:p-12 text-center">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EAE2D2] text-[#8C5D17] flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#2C2621]">
              The Literary Catalogue Is Ready
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5E51] leading-relaxed">
              Enlist your books with an external image URL cover and direct retailer purchase links (Amazon, Bookshop.org, or your own store).
              Once books are added, automatic JavaScript algorithms curate Book of the Week, Pick of the Day, and Featured 10 Books of the Week.
            </p>
            {onOpenAuthorDashboard && (
              <div className="pt-2">
                <button
                  onClick={onOpenAuthorDashboard}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2C2621] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] hover:bg-[#3E362F] transition shadow-xs"
                >
                  <PlusCircle className="w-4 h-4 text-[#D99B3B]" />
                  <span>Enlist Your First Book as Author</span>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. HERO: BOOK OF THE WEEK (Automated: most reviews, comments, ratings) */}
      {bookOfTheWeek && (
        <section className="relative overflow-hidden rounded-3xl border border-[#D5C9B3] bg-gradient-to-br from-[#F5EFE3] via-[#FAF7F0] to-[#EFE6D5] p-6 sm:p-10 shadow-sm">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Cover */}
            <div className="md:col-span-4 flex justify-center">
              <div
                onClick={() => onSelectBook(bookOfTheWeek)}
                className="w-52 sm:w-60 aspect-2/3 rounded-xl overflow-hidden book-shadow book-spine cursor-pointer transition transform hover:scale-103 bg-[#FAF8F5]"
              >
                <img
                  src={bookOfTheWeek.coverUrl}
                  alt={bookOfTheWeek.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Book Details */}
            <div className="md:col-span-8 flex flex-col justify-center text-center md:text-left">
              {/* Automated Tag Banner (Zero-Pill: typography) */}
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#2C2621] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#FAF8F5]">
                  <Trophy className="w-3.5 h-3.5 text-[#D99B3B]" />
                  <span>Book of the Week</span>
                </span>
                <span className="text-xs text-[#7A6F64]">
                  · Automated community pick (Most reviews & ratings)
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C2621] leading-tight">
                {bookOfTheWeek.title}
              </h1>
              {bookOfTheWeek.subtitle && (
                <p className="font-serif text-base sm:text-lg italic text-[#6B5E51] mt-1">
                  {bookOfTheWeek.subtitle}
                </p>
              )}

              {/* Author & Rating */}
              <div className="mt-3 flex items-center justify-center md:justify-start gap-4 flex-wrap text-xs text-[#5C4F42]">
                <button
                  onClick={() => onSelectAuthor(bookOfTheWeek.authorId)}
                  className="font-semibold text-sm underline decoration-[#D99B3B] underline-offset-4 hover:text-[#B2741E]"
                >
                  by {bookOfTheWeek.authorName}
                </button>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-[#8C5D17]">{bookOfTheWeek.genre}</span>
                <span aria-hidden="true">·</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#D99B3B] text-[#D99B3B]" />
                  <span className="font-bold text-sm text-[#2C2621]">
                    {botwStats?.averageRating || '5.0'}
                  </span>
                  <span className="text-[#7A6F64]">
                    ({botwStats?.reviewsCount} reviews · {botwStats?.shelvesCount} shelved)
                  </span>
                </div>
              </div>

              {/* Synopsis */}
              <p className="mt-4 text-xs sm:text-sm text-[#4D4135] leading-relaxed line-clamp-3">
                {bookOfTheWeek.synopsis}
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-center md:justify-start gap-3 flex-wrap">
                <button
                  onClick={() => onSelectBook(bookOfTheWeek)}
                  className="rounded-xl bg-[#2C2621] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] hover:bg-[#3E362F] transition shadow-xs"
                >
                  Explore Story & Reviews
                </button>

                <a
                  href={bookOfTheWeek.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-[#D5B876] bg-[#FAF8F5] px-4 py-2.5 text-xs font-semibold text-[#7A5418] hover:bg-white transition flex items-center gap-1.5 shadow-xs"
                >
                  <span>Buy on {bookOfTheWeek.purchaseRetailerName || 'Retailer'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. AUTOMATIC TEMPORAL PICKS: DAY · WEEK · MONTH · YEAR */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B2741E]" />
              <h2 className="font-serif text-2xl font-bold text-[#2C2621]">
                Algorithmic Time Picks
              </h2>
            </div>
            <p className="text-xs text-[#7A6F64] mt-0.5">
              Determined by continuous JavaScript engagement equations tracking reading velocity and ratings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Pick of the Day */}
          {pickOfTheDay && (
            <div className="relative">
              <BookCard
                book={pickOfTheDay}
                reviews={reviews}
                shelves={shelves}
                currentUserId={currentUser.id}
                onSelectBook={onSelectBook}
                onSelectAuthor={onSelectAuthor}
                onShelfChange={onShelfChange}
                badgeLabel="Pick of the Day"
              />
            </div>
          )}

          {/* Pick of the Week */}
          {bookOfTheWeek && (
            <div className="relative">
              <BookCard
                book={bookOfTheWeek}
                reviews={reviews}
                shelves={shelves}
                currentUserId={currentUser.id}
                onSelectBook={onSelectBook}
                onSelectAuthor={onSelectAuthor}
                onShelfChange={onShelfChange}
                badgeLabel="Pick of the Week"
              />
            </div>
          )}

          {/* Pick of the Month */}
          {pickOfTheMonth && (
            <div className="relative">
              <BookCard
                book={pickOfTheMonth}
                reviews={reviews}
                shelves={shelves}
                currentUserId={currentUser.id}
                onSelectBook={onSelectBook}
                onSelectAuthor={onSelectAuthor}
                onShelfChange={onShelfChange}
                badgeLabel="Pick of the Month"
              />
            </div>
          )}

          {/* Pick of the Year */}
          {pickOfTheYear && (
            <div className="relative">
              <BookCard
                book={pickOfTheYear}
                reviews={reviews}
                shelves={shelves}
                currentUserId={currentUser.id}
                onSelectBook={onSelectBook}
                onSelectAuthor={onSelectAuthor}
                onShelfChange={onShelfChange}
                badgeLabel={`Pick of the Year ${year}`}
              />
            </div>
          )}
        </div>
      </section>

      {/* 3. AUTOMATICALLY ROTATED FEATURED BOOKS (Dynamically & Randomly picked) */}
      {weekly10Books.length > 0 && (
        <section className="rounded-3xl border border-[#E5DEC9] bg-[#FAF8F5] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-[#B2741E]" />
                <h2 className="font-serif text-2xl font-bold text-[#2C2621]">
                  Featured Indie Books
                </h2>
              </div>
              <p className="text-xs text-[#7A6F64] mt-0.5">
                Randomly rotated and dynamically picked indie books for fair author exposure.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#8C5D17] bg-[#EFE8D8] px-3 py-1 rounded-full self-start sm:self-auto flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#B2741E]" />
              <span>{weekly10Books.length} Featured Picks Active</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {weekly10Books.map((book, idx) => (
              <BookCard
                key={book.id}
                book={book}
                reviews={reviews}
                shelves={shelves}
                currentUserId={currentUser.id}
                onSelectBook={onSelectBook}
                onSelectAuthor={onSelectAuthor}
                onShelfChange={onShelfChange}
                badgeLabel={`Featured #${idx + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* RECENTLY ADDED BOOKS (Auto-listed on Explore) */}
      {recentlyAddedBooks.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B2741E]" />
                <h2 className="font-serif text-2xl font-bold text-[#2C2621]">
                  Recently Added Books
                </h2>
              </div>
              <p className="text-xs text-[#7A6F64] mt-0.5">
                New independent stories freshly enlisted by our author community.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#8C5D17]">
              {recentlyAddedBooks.length} New Releases
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {recentlyAddedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                reviews={reviews}
                shelves={shelves}
                currentUserId={currentUser.id}
                onSelectBook={onSelectBook}
                onSelectAuthor={onSelectAuthor}
                onShelfChange={onShelfChange}
                badgeLabel="New Arrival"
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. POPULAR READER-CURATED LISTS */}
      {popularLists.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#2C2621]">
                Community-Curated Reading Lists
              </h2>
              <p className="text-xs text-[#7A6F64] mt-0.5">
                Popular book lists crafted by passionate readers, automatically surfaced by community upvotes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularLists.map((list) => {
              const isLiked = list.likedByUserIds.includes(currentUser.id);
              const listBooks = list.bookIds
                .map((id) => books.find((b) => b.id === id))
                .filter((b): b is Book => Boolean(b));

              return (
                <div
                  key={list.id}
                  className="rounded-2xl border border-[#E5DEC9] bg-[#FAF8F5] p-5 sm:p-6 space-y-4 hover:border-[#C8BC9F] transition shadow-xs"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={list.creatorAvatar}
                        alt={list.creatorName}
                        className="w-8 h-8 rounded-full object-cover border border-[#D5C9B3]"
                      />
                      <div>
                        <span className="font-semibold text-xs text-[#2C2621]">
                          {list.creatorName}
                        </span>
                        <span className="text-[10px] text-[#8C7E70] block">Curator</span>
                      </div>
                    </div>

                    {/* Upvote / Like Button */}
                    <button
                      onClick={() => onToggleLikeList(list.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                        isLiked
                          ? 'bg-[#B2741E] text-white'
                          : 'bg-[#EFE8D8] text-[#5C4F42] hover:bg-[#E5DEC9]'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{list.likesCount}</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#2C2621]">
                      {list.title}
                    </h3>
                    <p className="text-xs text-[#5C4F42] mt-1 leading-relaxed">
                      {list.description}
                    </p>
                  </div>

                  {/* Horizontal Scroll of Covers */}
                  <div className="flex items-center gap-3 overflow-x-auto py-2">
                    {listBooks.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => onSelectBook(b)}
                        className="w-16 aspect-2/3 rounded-sm overflow-hidden flex-shrink-0 cursor-pointer book-spine hover:opacity-90 transition transform hover:-translate-y-1"
                        title={b.title}
                      >
                        <img
                          src={b.coverUrl}
                          alt={b.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. BOOKS LISTED BY GENRES */}
      <section>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#2C2621]">
              Browse Books by Genre
            </h2>
            <p className="text-xs text-[#7A6F64] mt-0.5">
              Discover stories catalogued across independent literary categories.
            </p>
          </div>

          {/* Interactive Genre Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedGenre('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedGenre === 'all'
                  ? 'bg-[#2C2621] text-[#FAF8F5]'
                  : 'bg-[#EFE8D8] text-[#4D4135] hover:bg-[#E5DEC9]'
              }`}
            >
              All Genres ({books.length})
            </button>
            {genreGroups.map((g) => (
              <button
                key={g.genre}
                onClick={() => setSelectedGenre(g.genre)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  selectedGenre === g.genre
                    ? 'bg-[#2C2621] text-[#FAF8F5]'
                    : 'bg-[#EFE8D8] text-[#4D4135] hover:bg-[#E5DEC9]'
                }`}
              >
                {g.genre} ({g.count})
              </button>
            ))}
          </div>
        </div>

        {/* Selected Genre Display */}
        {selectedGenre === 'all' ? (
          <div className="space-y-12">
            {genreGroups.map((group) => (
              <div key={group.genre} className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-2">
                  <h3 className="font-serif text-xl font-bold text-[#2C2621]">
                    {group.genre}
                  </h3>
                  <button
                    onClick={() => setSelectedGenre(group.genre)}
                    className="text-xs text-[#8C5D17] hover:underline flex items-center gap-1"
                  >
                    <span>View all ({group.count})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {group.books.slice(0, 4).map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      reviews={reviews}
                      shelves={shelves}
                      currentUserId={currentUser.id}
                      onSelectBook={onSelectBook}
                      onSelectAuthor={onSelectAuthor}
                      onShelfChange={onShelfChange}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {books
              .filter((b) => b.genre === selectedGenre)
              .map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  reviews={reviews}
                  shelves={shelves}
                  currentUserId={currentUser.id}
                  onSelectBook={onSelectBook}
                  onSelectAuthor={onSelectAuthor}
                  onShelfChange={onShelfChange}
                />
              ))}
          </div>
        )}
      </section>
    </div>
  );
};
