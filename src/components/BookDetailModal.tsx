import React, { useState } from 'react';
import { Book, Review, ShelfItem, ShelfStatus, User, Question } from '../types';
import { calculateBookStats } from '../lib/picksEngine';
import {
  X,
  Star,
  ExternalLink,
  Bookmark,
  Check,
  Send,
  MessageSquare,
  BookOpen,
  Share2,
  Calendar,
  Layers,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface BookDetailModalProps {
  book: Book;
  reviews: Review[];
  shelves: ShelfItem[];
  questions: Question[];
  currentUser: User;
  onClose: () => void;
  onSelectAuthor: (authorId: string) => void;
  onShelfChange: (bookId: string, status: ShelfStatus | 'remove') => void;
  onAddReview: (bookId: string, rating: number, comment: string) => void;
  onAskQuestion: (authorId: string, questionText: string, bookId?: string) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  reviews,
  shelves,
  questions,
  currentUser,
  onClose,
  onSelectAuthor,
  onShelfChange,
  onAddReview,
  onAskQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'qa'>('reviews');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [imgError, setImgError] = useState(false);

  const stats = calculateBookStats(book, reviews, shelves);
  const userShelf = shelves.find((s) => s.userId === currentUser.id && s.bookId === book.id);
  const bookReviews = reviews.filter((r) => r.bookId === book.id);
  const bookQuestions = questions.filter(
    (q) => q.bookId === book.id || (q.authorId === book.authorId && !q.bookId)
  );

  const coverSrc = imgError
    ? 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
    : book.coverUrl;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    onAddReview(book.id, rating, reviewComment);
    setReviewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    onAskQuestion(book.authorId, questionText, book.id);
    setQuestionText('');
    setQuestionSubmitted(true);
    setTimeout(() => setQuestionSubmitted(false), 4000);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2621]/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div
        className="relative my-8 w-full max-w-4xl rounded-2xl bg-[#FAF8F5] shadow-2xl border border-[#DDD5C5] overflow-hidden text-[#2C2621]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 rounded-full bg-[#EFE8D8] p-2 text-[#5E5246] hover:bg-[#E2D7C2] hover:text-[#2C2621] transition shadow-xs"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Book Cover & Quick Purchase */}
          <div className="md:col-span-5 bg-[#F4EFE6] p-6 sm:p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-[#E5DEC9]">
            <div className="w-48 sm:w-56 aspect-2/3 rounded-lg overflow-hidden book-shadow book-spine mb-6 bg-[#FAF8F5]">
              <img
                src={coverSrc}
                alt={book.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Direct Purchase Link (Author specified purchase link) */}
            <a
              href={book.purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-xl bg-[#2C2621] py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] hover:bg-[#433A33] transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Get Book on {book.purchaseRetailerName || 'Retailer'}</span>
              <ExternalLink className="w-4 h-4 text-[#D99B3B]" />
            </a>
            <p className="mt-2 text-[11px] text-[#7A6F64] text-center">
              Direct purchase supporting independent authors with zero commission cut.
            </p>

            {/* Shelf Management Buttons */}
            <div className="mt-6 w-full pt-6 border-t border-[#DDD5C5]">
              <span className="block text-[11px] font-semibold text-[#8C7E70] uppercase tracking-wider mb-2">
                Your Reading Shelf
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#EAE2D2] rounded-lg">
                <button
                  onClick={() => onShelfChange(book.id, 'want_to_read')}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium transition text-center ${
                    userShelf?.status === 'want_to_read'
                      ? 'bg-[#FAF8F5] text-[#B2741E] font-bold shadow-xs'
                      : 'text-[#6B5E51] hover:text-[#2C2621]'
                  }`}
                >
                  To Read
                </button>
                <button
                  onClick={() => onShelfChange(book.id, 'reading')}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium transition text-center ${
                    userShelf?.status === 'reading'
                      ? 'bg-[#FAF8F5] text-[#B2741E] font-bold shadow-xs'
                      : 'text-[#6B5E51] hover:text-[#2C2621]'
                  }`}
                >
                  Reading
                </button>
                <button
                  onClick={() => onShelfChange(book.id, 'finished')}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium transition text-center ${
                    userShelf?.status === 'finished'
                      ? 'bg-[#FAF8F5] text-[#B2741E] font-bold shadow-xs'
                      : 'text-[#6B5E51] hover:text-[#2C2621]'
                  }`}
                >
                  Finished
                </button>
              </div>

              {userShelf && (
                <button
                  onClick={() => onShelfChange(book.id, 'remove')}
                  className="mt-2 text-[11px] text-[#9A3B3B] hover:underline block text-center w-full"
                >
                  Remove from my shelf
                </button>
              )}
            </div>

            {/* Shelf Stats Counter */}
            <div className="mt-5 w-full flex items-center justify-between text-xs text-[#7A6F64] pt-4 border-t border-[#DDD5C5]">
              <span>{stats.shelvesCount} Readers Shelved</span>
              <span>{book.viewsCount || 1} Views</span>
            </div>
          </div>

          {/* Right Column: Book Content, Reviews, Q&A */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col">
            {/* Metadata (Genre, Year, Tags) - Zero-Pill Discipline */}
            <div className="flex items-center gap-2 text-xs text-[#7A6F64] mb-2 flex-wrap">
              <span className="font-semibold text-[#8C5D17]">{book.genre}</span>
              <span aria-hidden="true">·</span>
              <span>Published {book.publishedYear}</span>
              {book.pageCount && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{book.pageCount} pages</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 text-[#8C5D17] hover:underline"
              >
                <Share2 className="w-3 h-3" />
                <span>{copiedLink ? 'Copied!' : 'Share'}</span>
              </button>
            </div>

            {/* Title & Subtitle */}
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2621] leading-tight">
              {book.title}
            </h1>
            {book.subtitle && (
              <p className="font-serif text-sm italic text-[#6B5E51] mt-1">
                {book.subtitle}
              </p>
            )}

            {/* Author Link */}
            <div className="mt-3 flex items-center gap-2.5">
              <button
                onClick={() => {
                  onSelectAuthor(book.authorId);
                  onClose();
                }}
                className="text-sm font-semibold text-[#5C4F42] hover:text-[#B2741E] flex items-center gap-2 group"
              >
                <span>Written by</span>
                <span className="underline decoration-[#D99B3B] underline-offset-4 group-hover:text-[#B2741E]">
                  {book.authorName}
                </span>
              </button>
            </div>

            {/* Rating summary */}
            <div className="mt-4 flex items-center gap-3 pb-5 border-b border-[#E5DEC9]">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(stats.averageRating)
                        ? 'fill-[#D99B3B] text-[#D99B3B]'
                        : 'text-[#DDD5C5]'
                    }`}
                  />
                ))}
              </div>
              <span className="font-serif font-bold text-base text-[#2C2621]">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'No ratings yet'}
              </span>
              <span className="text-xs text-[#7A6F64]">
                ({stats.reviewsCount} {stats.reviewsCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Synopsis */}
            <div className="mt-5 prose prose-stone max-w-none text-xs sm:text-sm text-[#4D4135] leading-relaxed">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8C7E70] mb-2">
                Synopsis
              </h4>
              <p>{book.synopsis}</p>
            </div>

            {/* Tags (Zero-Pill: subtle subtle list) */}
            {book.tags && book.tags.length > 0 && (
              <div className="mt-4 flex items-center gap-2 flex-wrap text-xs text-[#7A6F64]">
                <span className="text-[11px] font-semibold text-[#8C7E70]">Themes:</span>
                {book.tags.map((tag, idx) => (
                  <span key={tag} className="italic">
                    #{tag}{idx < book.tags.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            )}

            {/* Tab Navigation: Community Reviews vs Author Q&A */}
            <div className="mt-8 border-b border-[#DDD5C5] flex items-center gap-4">
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2.5 text-xs font-semibold uppercase tracking-wider transition relative ${
                  activeTab === 'reviews'
                    ? 'text-[#2C2621] border-b-2 border-[#B2741E]'
                    : 'text-[#8C7E70] hover:text-[#2C2621]'
                }`}
              >
                Community Reviews ({bookReviews.length})
              </button>
              <button
                onClick={() => setActiveTab('qa')}
                className={`pb-2.5 text-xs font-semibold uppercase tracking-wider transition relative flex items-center gap-1.5 ${
                  activeTab === 'qa'
                    ? 'text-[#2C2621] border-b-2 border-[#B2741E]'
                    : 'text-[#8C7E70] hover:text-[#2C2621]'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#B2741E]" />
                <span>Author Q&A ({bookQuestions.length})</span>
              </button>
            </div>

            {/* TAB CONTENT: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="mt-5 space-y-6">
                {/* Leave a review form */}
                <form
                  onSubmit={handleReviewSubmit}
                  className="rounded-xl border border-[#E5DEC9] bg-[#F8F4EC] p-4 text-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#3E362F]">
                      Leave Your Rating & Review
                    </span>
                    {/* Star selector */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-0.5 focus:outline-hidden"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= (hoverRating || rating)
                                ? 'fill-[#D99B3B] text-[#D99B3B]'
                                : 'text-[#DDD5C5]'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="What did you think of the story, prose, or characters? Keep indie reviews encouraging and thoughtful..."
                    className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-2.5 text-xs text-[#2C2621] placeholder-[#948779] focus:border-[#B2741E] focus:outline-hidden"
                    required
                  />

                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[11px] text-[#7A6F64]">
                      Posting as {currentUser.name}
                    </span>
                    <button
                      type="submit"
                      className="rounded-lg bg-[#2C2621] px-3.5 py-1.5 text-xs font-semibold text-[#FAF8F5] hover:bg-[#433A33] transition"
                    >
                      Post Review
                    </button>
                  </div>

                  {reviewSubmitted && (
                    <div className="mt-2 text-xs font-medium text-emerald-700">
                      ✓ Thank you! Your review has been added to the book.
                    </div>
                  )}
                </form>

                {/* Reviews List */}
                <div className="space-y-4">
                  {bookReviews.length === 0 ? (
                    <p className="text-xs text-[#8C7E70] italic text-center py-4">
                      No reader reviews yet. Be the first to share your thoughts on this indie book!
                    </p>
                  ) : (
                    bookReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="rounded-xl border border-[#EBE3D3] bg-[#FAF8F5] p-3.5 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={rev.userAvatar}
                              alt={rev.userName}
                              className="w-6 h-6 rounded-full object-cover border border-[#D5C9B3]"
                            />
                            <span className="font-semibold text-[#2C2621]">{rev.userName}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= rev.rating
                                    ? 'fill-[#D99B3B] text-[#D99B3B]'
                                    : 'text-[#DDD5C5]'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-[#4D4135] leading-relaxed pl-8">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: AUTHOR Q&A */}
            {activeTab === 'qa' && (
              <div className="mt-5 space-y-6">
                {/* Ask a question form */}
                <form
                  onSubmit={handleQuestionSubmit}
                  className="rounded-xl border border-[#E5DEC9] bg-[#F8F4EC] p-4 text-xs"
                >
                  <span className="block font-semibold text-[#3E362F] mb-1.5">
                    Ask {book.authorName} a Question
                  </span>
                  <textarea
                    rows={2}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Ask about inspirations, characters, writing routines, or book themes..."
                    className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-2.5 text-xs text-[#2C2621] placeholder-[#948779] focus:border-[#B2741E] focus:outline-hidden"
                    required
                  />
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[11px] text-[#7A6F64]">
                      Asking as {currentUser.name}
                    </span>
                    <button
                      type="submit"
                      className="rounded-lg bg-[#2C2621] px-3.5 py-1.5 text-xs font-semibold text-[#FAF8F5] hover:bg-[#433A33] transition"
                    >
                      Send to Author
                    </button>
                  </div>
                  {questionSubmitted && (
                    <div className="mt-2 text-xs font-medium text-emerald-700">
                      ✓ Your question has been delivered to {book.authorName}!
                    </div>
                  )}
                </form>

                {/* Q&A List */}
                <div className="space-y-4">
                  {bookQuestions.length === 0 ? (
                    <p className="text-xs text-[#8C7E70] italic text-center py-4">
                      No questions asked yet. Have a burning curiosity? Ask the author above!
                    </p>
                  ) : (
                    bookQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="rounded-xl border border-[#EBE3D3] bg-[#FAF8F5] p-4 text-xs space-y-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <img
                            src={q.askerAvatar}
                            alt={q.askerName}
                            className="w-6 h-6 rounded-full object-cover border border-[#D5C9B3] mt-0.5"
                          />
                          <div>
                            <span className="font-semibold text-[#2C2621]">{q.askerName}</span>
                            <span className="text-[11px] text-[#8C7E70] ml-2">asked:</span>
                            <p className="text-[#3E362F] mt-0.5 font-serif italic text-sm">
                              "{q.questionText}"
                            </p>
                          </div>
                        </div>

                        {/* Author Answer */}
                        {q.answerText ? (
                          <div className="pl-6 border-l-2 border-[#D99B3B] ml-3 mt-2 bg-[#F9F5EC] p-3 rounded-r-lg">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8C5D17] mb-1">
                              <Sparkles className="w-3 h-3 text-[#B2741E]" />
                              <span>{book.authorName} (Author Reply)</span>
                            </div>
                            <p className="text-[#4D4135] leading-relaxed">{q.answerText}</p>
                          </div>
                        ) : (
                          <p className="text-[11px] text-[#8C7E70] italic pl-8">
                            Awaiting response from {book.authorName}...
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
