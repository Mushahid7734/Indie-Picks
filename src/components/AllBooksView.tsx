import React, { useState } from 'react';
import { Book, Review, ShelfItem, ShelfStatus } from '../types';
import { BookCard } from './BookCard';
import { calculateBookStats } from '../lib/picksEngine';
import { BookOpen, Filter, ArrowUpDown } from 'lucide-react';

interface AllBooksViewProps {
  books: Book[];
  reviews: Review[];
  shelves: ShelfItem[];
  currentUserId: string;
  searchQuery: string;
  onSelectBook: (book: Book) => void;
  onSelectAuthor: (authorId: string) => void;
  onShelfChange: (bookId: string, status: ShelfStatus | 'remove') => void;
}

export const AllBooksView: React.FC<AllBooksViewProps> = ({
  books,
  reviews,
  shelves,
  currentUserId,
  searchQuery,
  onSelectBook,
  onSelectAuthor,
  onShelfChange,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'newest' | 'title'>('popularity');

  // Filter by search query and genre
  const filteredBooks = books.filter((book) => {
    const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;
    if (!matchesGenre) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(q) ||
      book.authorName.toLowerCase().includes(q) ||
      book.genre.toLowerCase().includes(q) ||
      (book.subtitle && book.subtitle.toLowerCase().includes(q)) ||
      (book.tags && book.tags.some((t) => t.toLowerCase().includes(q))) ||
      book.synopsis.toLowerCase().includes(q)
    );
  });

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    const statsA = calculateBookStats(a, reviews, shelves);
    const statsB = calculateBookStats(b, reviews, shelves);

    if (sortBy === 'rating') {
      return statsB.averageRating - statsA.averageRating;
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    // default popularity
    return statsB.popularityScore - statsA.popularityScore;
  });

  // All unique genres
  const allGenres = Array.from(new Set(books.map((b) => b.genre))).sort();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#2C2621]">
          Indie Books Catalogue
        </h1>
        <p className="text-xs text-[#7A6F64] mt-1">
          Explore {books.length} titles published directly by independent authors without middlemen.
        </p>

        {/* Filters and sorting bar */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5DEC9] pb-4">
          {/* Genre Pills (Interactive segmented controls) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-3xl">
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
            {allGenres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  selectedGenre === g
                    ? 'bg-[#2C2621] text-[#FAF8F5]'
                    : 'bg-[#EFE8D8] text-[#4D4135] hover:bg-[#E5DEC9]'
                }`}
              >
                {g} ({books.filter((b) => b.genre === g).length})
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8C7E70]" />
            <span className="text-xs text-[#7A6F64]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] px-2.5 py-1 text-xs text-[#2C2621]"
            >
              <option value="popularity">Popularity & Velocity</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Recently Published</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {sortedBooks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DDD5C5] bg-[#FAF8F5] p-12 text-center">
          <BookOpen className="w-8 h-8 text-[#8C7E70] mx-auto mb-2" />
          <p className="text-sm text-[#6B5E51]">
            No books found matching your current filter. Try adjusting your search query or genre selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {sortedBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              reviews={reviews}
              shelves={shelves}
              currentUserId={currentUserId}
              onSelectBook={onSelectBook}
              onSelectAuthor={onSelectAuthor}
              onShelfChange={onShelfChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};
