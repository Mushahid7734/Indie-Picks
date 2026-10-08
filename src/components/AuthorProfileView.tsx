import React, { useState } from 'react';
import { User, Book, Question, Review, ShelfItem, ShelfStatus } from '../types';
import { BookCard } from './BookCard';
import {
  Feather,
  Globe,
  Share2,
  Check,
  HelpCircle,
  Sparkles,
  Send,
  BookOpen,
  MessageSquare,
  Award,
} from 'lucide-react';

interface AuthorProfileViewProps {
  author: User;
  books: Book[];
  reviews: Review[];
  shelves: ShelfItem[];
  questions: Question[];
  currentUser: User;
  onSelectBook: (book: Book) => void;
  onShelfChange: (bookId: string, status: ShelfStatus | 'remove') => void;
  onAskQuestion: (authorId: string, questionText: string, bookId?: string) => void;
  onOpenDashboard: () => void;
  onToggleFollowUser?: (targetUserId: string) => void;
}

export const AuthorProfileView: React.FC<AuthorProfileViewProps> = ({
  author,
  books,
  reviews,
  shelves,
  questions,
  currentUser,
  onSelectBook,
  onShelfChange,
  onAskQuestion,
  onOpenDashboard,
  onToggleFollowUser,
}) => {
  const [questionText, setQuestionText] = useState('');
  const [selectedBookForQ, setSelectedBookForQ] = useState<string>('');
  const [questionSent, setQuestionSent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const authorBooks = books.filter((b) => b.authorId === author.id);
  const authorQuestions = questions.filter((q) => q.authorId === author.id);
  const isSelf = currentUser.id === author.id;

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    onAskQuestion(author.id, questionText, selectedBookForQ || undefined);
    setQuestionText('');
    setQuestionSent(true);
    setTimeout(() => setQuestionSent(false), 4000);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Author Hero Header */}
      <div className="relative rounded-2xl border border-[#E5DEC9] bg-[#F7F3EA] p-6 sm:p-10 shadow-xs mb-10 overflow-hidden">
        {/* Subtle decorative background watermarks */}
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-[#2C2621]">
          <Feather className="w-64 h-64" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          {/* Avatar / Portrait */}
          <div className="relative flex-shrink-0">
            <img
              src={author.avatarUrl}
              alt={author.name}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border-2 border-[#D8CFBF] book-shadow"
            />
            {author.isMasonCarter && (
              <div className="absolute -bottom-2 -right-2 rounded-full bg-[#2C2621] p-1.5 text-[#D99B3B] shadow-md" title="Mason Carter">
                <Sparkles className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Author Details */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C2621]">
                    {author.name}
                  </h1>
                  {author.isMasonCarter && (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-[#D99B3B]/20 px-2 py-0.5 text-xs font-semibold text-[#8C5D17]">
                      <Award className="w-3 h-3" />
                      Featured Author
                    </span>
                  )}
                </div>
                {author.penName && author.penName !== author.name && (
                  <p className="font-serif text-xs italic text-[#7A6F64] mt-0.5">
                    Writing as {author.penName}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center md:justify-end gap-2">
                {!isSelf && onToggleFollowUser && currentUser && (
                  <button
                    onClick={() => onToggleFollowUser(author.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition shadow-xs ${
                      (currentUser.followingUserIds || []).includes(author.id)
                        ? 'border border-[#B2741E] bg-[#FAF5E8] text-[#8C5D17] hover:bg-[#F2E8D0]'
                        : 'bg-[#2C2621] text-[#FAF8F5] hover:bg-[#3E362F]'
                    }`}
                  >
                    {(currentUser.followingUserIds || []).includes(author.id) ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#B2741E]" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <Feather className="w-3.5 h-3.5 text-[#D99B3B]" />
                        <span>Follow Author</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] px-3.5 py-2 text-xs font-medium text-[#4D4135] hover:bg-white transition"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-[#8C5D17]" />
                      <span>Share Profile</span>
                    </>
                  )}
                </button>

                {isSelf && (
                  <button
                    onClick={onOpenDashboard}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#2C2621] px-4 py-2 text-xs font-semibold text-[#FAF8F5] hover:bg-[#3E362F] transition shadow-xs"
                  >
                    <span>Manage My Books</span>
                  </button>
                )}
              </div>
            </div>

            {/* Author Bio (Max 150 Words Guarantee) */}
            <div className="mt-4 max-w-3xl">
              <p className="font-serif text-sm sm:text-base text-[#4D4135] leading-relaxed">
                "{author.bio}"
              </p>
            </div>

            {/* External Links & Stats (Zero-Pill with Followers Count) */}
            <div className="mt-5 flex items-center justify-center md:justify-start gap-4 flex-wrap text-xs text-[#6B5E51]">
              <span className="font-semibold text-[#8C5D17]">
                {author.followerCount || 0} Followers
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[#2C2621]">
                {authorBooks.length} {authorBooks.length === 1 ? 'Book' : 'Books'} Published
              </span>
              <span aria-hidden="true">·</span>
              <span>{authorQuestions.length} Reader Q&As</span>
              {author.websiteUrl && (
                <>
                  <span aria-hidden="true">·</span>
                  <a
                    href={author.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#8C5D17] hover:underline"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Official Website</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Published Books Grid */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#2C2621]">
              Books by {author.name}
            </h2>
            <p className="text-xs text-[#7A6F64] mt-0.5">
              Available directly from independent channels, small presses, and authorized retailers.
            </p>
          </div>
        </div>

        {authorBooks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#DDD5C5] p-12 text-center bg-[#FAF8F5]">
            <BookOpen className="w-8 h-8 text-[#8C7E70] mx-auto mb-2" />
            <p className="text-sm text-[#6B5E51]">
              No books published yet by this author.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {authorBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                reviews={reviews}
                shelves={shelves}
                currentUserId={currentUser.id}
                onSelectBook={onSelectBook}
                onSelectAuthor={() => {}}
                onShelfChange={onShelfChange}
              />
            ))}
          </div>
        )}
      </section>

      {/* Reader Q&A & Interview Section */}
      <section className="rounded-2xl border border-[#E5DEC9] bg-[#FAF8F5] p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-[#B2741E]" />
            <h2 className="font-serif text-2xl font-bold text-[#2C2621]">
              Ask {author.name}
            </h2>
          </div>
          <p className="text-xs text-[#7A6F64] mb-6 leading-relaxed">
            Connect directly with {author.name}. Ask about character arcs, indie publishing trials, writing routines, or book recommendations.
          </p>

          {/* Question Form */}
          <form onSubmit={handleQuestionSubmit} className="mb-8 rounded-xl border border-[#E5DEC9] bg-[#F7F3EA] p-4 text-xs space-y-3">
            {authorBooks.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-[#8C7E70] mb-1">
                  Regarding Specific Book (Optional)
                </label>
                <select
                  value={selectedBookForQ}
                  onChange={(e) => setSelectedBookForQ(e.target.value)}
                  className="rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] px-3 py-1.5 text-xs text-[#2C2621]"
                >
                  <option value="">General Author Question</option>
                  {authorBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <textarea
                rows={2}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder={`Ask ${author.name} anything about their writing or stories...`}
                className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-3 text-xs text-[#2C2621] placeholder-[#948779] focus:border-[#B2741E] focus:outline-hidden"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#7A6F64]">
                Posting as {currentUser.name}
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#2C2621] px-4 py-2 text-xs font-semibold text-[#FAF8F5] hover:bg-[#3E362F] transition"
              >
                <Send className="w-3.5 h-3.5 text-[#D99B3B]" />
                <span>Submit Question</span>
              </button>
            </div>

            {questionSent && (
              <div className="text-xs font-medium text-emerald-700">
                ✓ Question submitted to {author.name}! Replies will appear here once answered.
              </div>
            )}
          </form>

          {/* Answered Questions List */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C7E70] mb-3">
              Reader Questions & Author Answers
            </h3>

            {authorQuestions.length === 0 ? (
              <p className="text-xs text-[#8C7E70] italic">
                No public questions answered yet. Be the first to ask!
              </p>
            ) : (
              authorQuestions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-[#E5DEC9] bg-white p-4 text-xs space-y-3 shadow-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <img
                      src={q.askerAvatar}
                      alt={q.askerName}
                      className="w-7 h-7 rounded-full object-cover border border-[#D5C9B3] mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#2C2621]">{q.askerName}</span>
                        {q.bookTitle && (
                          <span className="text-[11px] text-[#8C5D17] italic">
                            re: {q.bookTitle}
                          </span>
                        )}
                      </div>
                      <p className="font-serif italic text-sm text-[#3E362F] mt-0.5">
                        "{q.questionText}"
                      </p>
                    </div>
                  </div>

                  {q.answerText ? (
                    <div className="pl-6 border-l-2 border-[#D99B3B] ml-3 bg-[#FAF8F5] p-3 rounded-r-lg">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8C5D17] mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#B2741E]" />
                        <span>{author.name} (Author Response)</span>
                      </div>
                      <p className="text-[#4D4135] leading-relaxed font-sans">{q.answerText}</p>
                    </div>
                  ) : (
                    <div className="pl-8 text-[11px] text-[#8C7E70] italic">
                      {isSelf ? (
                        <button
                          onClick={onOpenDashboard}
                          className="text-[#B2741E] underline font-medium"
                        >
                          You haven't replied to this question yet. Click to reply in your Studio.
                        </button>
                      ) : (
                        `Waiting for ${author.name}'s reply...`
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
