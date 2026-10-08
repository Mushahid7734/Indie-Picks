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
} from 'lucide-react';

interface ExploreTabProps {
  books: Book[];
  reviews: Review[];
  shelves: ShelfItem[];
  curatedLists: CuratedList[];
  currentUser: User;
  onSelectBook: (book: Book) => void;
  onSelectAuthor: (authorId: string) => void;
  onShelfChange: (bookId: string, status: ShelfStatus | 'remove') => void;
  onToggleLikeList: (listId: string) => void;
}

export const ExploreTab: React.FC<ExploreTabProps> = ({
  books,
  reviews,
  shelves,
  curatedLists,
  currentUser,
  onSelectBook,
  onSelectAuthor,
  onShelfChange,
  onToggleLikeList,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Algorithmic Picks computed purely in JavaScript
  const bookOfTheWeek = getBookOfTheWeek(books, reviews, shelves);
  const pickOfTheDay = getPickOfTheDay(books, reviews, shelves);
  const pickOfTheMonth = getPickOfTheMonth(books, reviews, shelves);
  const pickOfTheYear = getPickOfTheYear(books, reviews, shelves);
  const weekly10Books = getFeatured10BooksOfWeek(books, reviews, shelves);
  const popularLists = getPopularReaderLists(curatedLists).slice(0, 4);
  const genreGroups = groupBooksByGenre(books);
  const { week, year } = getISOWeek();

  // Book of the Week Stats
  const botwStats = bookOfTheWeek ? calculateBookStats(bookOfTheWeek, reviews, shelves) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-16 animate-fade-in">
      {/* 1. HERO: BOOK OF THE WEEK (Automated: most reviews, comments, ratings) */}
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

      {/* 3. AUTOMATICALLY 10 BOOKS PICKED EVERY WEEK AS FEATURED BOOKS */}
      <section className="rounded-3xl border border-[#E5DEC9] bg-[#FAF8F5] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#B2741E]" />
              <h2 className="font-serif text-2xl font-bold text-[#2C2621]">
                Featured 10 Books of the Week
              </h2>
            </div>
            <p className="text-xs text-[#7A6F64] mt-0.5">
              Automatically curated by JavaScript for Week #{week}, {year} to provide fair, algorithmic rotation for all indie authors.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#8C5D17] bg-[#EFE8D8] px-3 py-1 rounded-full self-start sm:self-auto">
            10 Weekly Selections Active
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
              badgeLabel={`#${idx + 1} This Week`}
            />
          ))}
        </div>
      </section>

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
