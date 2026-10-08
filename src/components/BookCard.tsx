import React, { useState } from 'react';
import { Book, Review, ShelfItem, ShelfStatus } from '../types';
import { calculateBookStats } from '../lib/picksEngine';
import { Star, ExternalLink, Bookmark, Check, BookOpen, Clock, Heart } from 'lucide-react';

interface BookCardProps {
  book: Book;
  reviews: Review[];
  shelves: ShelfItem[];
  currentUserId: string;
  onSelectBook: (book: Book) => void;
  onSelectAuthor: (authorId: string) => void;
  onShelfChange: (bookId: string, status: ShelfStatus | 'remove') => void;
  badgeLabel?: string;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  reviews,
  shelves,
  currentUserId,
  onSelectBook,
  onSelectAuthor,
  onShelfChange,
  badgeLabel,
}) => {
  const [imgError, setImgError] = useState(false);
  const [shelfMenuOpen, setShelfMenuOpen] = useState(false);

  const stats = calculateBookStats(book, reviews, shelves);
  const userShelf = shelves.find((s) => s.userId === currentUserId && s.bookId === book.id);

  // Fallback image URL
  const coverSrc = imgError
    ? 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
    : book.coverUrl;

  const handleShelfClick = (status: ShelfStatus | 'remove', e: React.MouseEvent) => {
    e.stopPropagation();
    onShelfChange(book.id, status);
    setShelfMenuOpen(false);
  };

  return (
    <div
      onClick={() => onSelectBook(book)}
      className="group relative flex flex-col rounded-xl border border-[#E5DEC9] bg-[#FAF8F5] transition-all hover:border-[#C8BC9F] hover:shadow-md cursor-pointer overflow-hidden"
    >
      {/* Top Tag or Editorial Banner */}
      {badgeLabel && (
        <div className="absolute top-2 left-2 z-10 rounded-sm bg-[#2C2621]/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#FAF8F5] backdrop-blur-xs">
          {badgeLabel}
        </div>
      )}

      {/* Book Cover Container with spine styling */}
      <div className="relative aspect-2/3 w-full overflow-hidden bg-[#EFE8D8] book-spine">
        <img
          src={coverSrc}
          alt={book.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
        />
        {/* Subtle shadow overlay */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_20px_rgba(44,38,33,0.1)]" />

        {/* Shelf Quick Action button in top right corner */}
        <div className="absolute top-2 right-2 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShelfMenuOpen(!shelfMenuOpen);
            }}
            className={`p-1.5 rounded-full shadow-sm transition backdrop-blur-md ${
              userShelf
                ? 'bg-[#B2741E] text-white hover:bg-[#8F5B13]'
                : 'bg-[#FAF8F5]/85 text-[#4D4135] hover:bg-white hover:text-[#2C2621]'
            }`}
            title="Add to reading shelf"
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>

          {shelfMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-1 w-36 rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] py-1 text-xs shadow-xl z-30"
            >
              <button
                onClick={(e) => handleShelfClick('want_to_read', e)}
                className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#F2ECE0] ${
                  userShelf?.status === 'want_to_read' ? 'font-bold text-[#B2741E]' : 'text-[#3E362F]'
                }`}
              >
                <span>Want to Read</span>
                {userShelf?.status === 'want_to_read' && <Check className="w-3 h-3" />}
              </button>
              <button
                onClick={(e) => handleShelfClick('reading', e)}
                className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#F2ECE0] ${
                  userShelf?.status === 'reading' ? 'font-bold text-[#B2741E]' : 'text-[#3E362F]'
                }`}
              >
                <span>Currently Reading</span>
                {userShelf?.status === 'reading' && <Check className="w-3 h-3" />}
              </button>
              <button
                onClick={(e) => handleShelfClick('finished', e)}
                className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#F2ECE0] ${
                  userShelf?.status === 'finished' ? 'font-bold text-[#B2741E]' : 'text-[#3E362F]'
                }`}
              >
                <span>Finished</span>
                {userShelf?.status === 'finished' && <Check className="w-3 h-3" />}
              </button>
              {userShelf && (
                <button
                  onClick={(e) => handleShelfClick('remove', e)}
                  className="w-full px-3 py-1 text-left text-red-600 hover:bg-red-50 border-t border-[#EAE2D2] text-[11px]"
                >
                  Remove from Shelf
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Book Meta Details */}
      <div className="flex flex-1 flex-col p-3.5">
        {/* Genre and Year - Zero-Pill text metadata with typographic dots */}
        <div className="mb-1 flex items-center gap-1.5 text-[11px] text-[#7A6F64]">
          <span className="font-medium text-[#8C5D17]">{book.genre}</span>
          <span aria-hidden="true">·</span>
          <span>{book.publishedYear}</span>
          {book.pageCount ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{book.pageCount} pp</span>
            </>
          ) : null}
        </div>

        {/* Title */}
        <h3 className="font-serif text-base font-bold text-[#2C2621] line-clamp-1 group-hover:text-[#B2741E] transition-colors">
          {book.title}
        </h3>

        {/* Author link */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectAuthor(book.authorId);
          }}
          className="mt-0.5 text-left text-xs font-medium text-[#5E5246] hover:text-[#B2741E] hover:underline transition truncate"
        >
          by {book.authorName}
        </button>

        {/* Synopsis snippet */}
        <p className="mt-2 text-xs text-[#6B5E51] line-clamp-2 leading-relaxed">
          {book.synopsis}
        </p>

        {/* Ratings and community engagement footer */}
        <div className="mt-auto pt-3 border-t border-[#EFE8D8] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-[#2C2621]">
            <Star className="w-3.5 h-3.5 fill-[#D99B3B] text-[#D99B3B]" />
            <span className="font-semibold text-xs">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'New'}
            </span>
            <span className="text-[11px] text-[#8C7E70]">
              ({stats.reviewsCount})
            </span>
          </div>

          {/* Direct purchase retailer link */}
          <a
            href={book.purchaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#7A5418] hover:text-[#2C2621] hover:underline transition"
            title={`Buy ${book.title} on ${book.purchaseRetailerName || 'Retailer'}`}
          >
            <span>{book.purchaseRetailerName || 'Get Book'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
