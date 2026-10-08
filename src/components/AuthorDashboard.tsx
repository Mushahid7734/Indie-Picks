import React, { useState } from 'react';
import { User, Book, Question, Review, ShelfItem } from '../types';
import { calculateBookStats } from '../lib/picksEngine';
import { countWords, isValidImageUrl } from '../lib/storage';
import {
  PlusCircle,
  BookOpen,
  HelpCircle,
  Edit3,
  Trash2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Check,
  AlertCircle,
  Eye,
  Star,
  Bookmark,
  Image as ImageIcon,
} from 'lucide-react';

interface AuthorDashboardProps {
  currentUser: User;
  books: Book[];
  reviews: Review[];
  shelves: ShelfItem[];
  questions: Question[];
  onAddBook: (bookData: Omit<Book, 'id' | 'createdAt' | 'viewsCount' | 'authorName' | 'authorAvatar'>) => void;
  onUpdateBook: (bookId: string, updates: Partial<Book>) => void;
  onDeleteBook: (bookId: string) => void;
  onAnswerQuestion: (questionId: string, answerText: string) => void;
  onUpdateProfile: (userId: string, data: Partial<User>) => void;
  onViewBook: (book: Book) => void;
}

export const AuthorDashboard: React.FC<AuthorDashboardProps> = ({
  currentUser,
  books,
  reviews,
  shelves,
  questions,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  onAnswerQuestion,
  onUpdateProfile,
  onViewBook,
}) => {
  const [activeTab, setActiveTab] = useState<'books' | 'add-book' | 'qa' | 'profile'>('books');
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  // Add Book Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [tagsInput, setTagsInput] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [purchaseUrl, setPurchaseUrl] = useState('');
  const [purchaseRetailerName, setPurchaseRetailerName] = useState('Bookshop.org');
  const [pageCount, setPageCount] = useState<number>(300);
  const [publishedYear, setPublishedYear] = useState<number>(new Date().getFullYear());
  const [bookFormError, setBookFormError] = useState<string | null>(null);
  const [bookFormSuccess, setBookFormSuccess] = useState<string | null>(null);

  // Profile Edit state
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profilePenName, setProfilePenName] = useState(currentUser.penName || currentUser.name);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(currentUser.avatarUrl);
  const [profileBio, setProfileBio] = useState(currentUser.bio);
  const [profileWebsite, setProfileWebsite] = useState(currentUser.websiteUrl || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Answering Q&A state
  const [replyTextMap, setReplyTextMap] = useState<{ [qId: string]: string }>({});

  const myBooks = books.filter((b) => b.authorId === currentUser.id);
  const myQuestions = questions.filter((q) => q.authorId === currentUser.id);
  const unansweredCount = myQuestions.filter((q) => !q.answerText).length;

  const currentBioWords = countWords(profileBio);

  const resetBookForm = () => {
    setTitle('');
    setSubtitle('');
    setGenre('Fantasy');
    setTagsInput('');
    setSynopsis('');
    setCoverUrl('');
    setPurchaseUrl('');
    setPurchaseRetailerName('Bookshop.org');
    setPageCount(300);
    setPublishedYear(new Date().getFullYear());
    setEditingBookId(null);
    setBookFormError(null);
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookFormError(null);

    if (!isValidImageUrl(coverUrl)) {
      setBookFormError('Please enter a valid HTTP/HTTPS image URL for the cover (e.g. from Unsplash, Imgur, or your website). Direct file uploads are prohibited to preserve Firebase free tier.');
      return;
    }

    if (!purchaseUrl.trim() || !purchaseUrl.startsWith('http')) {
      setBookFormError('Please provide a valid purchase redirect URL (e.g. Bookshop.org, Amazon, Author Direct Store).');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingBookId) {
        onUpdateBook(editingBookId, {
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          genre,
          tags,
          synopsis: synopsis.trim(),
          coverUrl: coverUrl.trim(),
          purchaseUrl: purchaseUrl.trim(),
          purchaseRetailerName: purchaseRetailerName.trim() || 'Retailer',
          pageCount: Number(pageCount) || 0,
          publishedYear: Number(publishedYear) || new Date().getFullYear(),
        });
        setBookFormSuccess('Book updated successfully!');
      } else {
        onAddBook({
          authorId: currentUser.id,
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          genre,
          tags,
          synopsis: synopsis.trim(),
          coverUrl: coverUrl.trim(),
          purchaseUrl: purchaseUrl.trim(),
          purchaseRetailerName: purchaseRetailerName.trim() || 'Retailer',
          pageCount: Number(pageCount) || 0,
          publishedYear: Number(publishedYear) || new Date().getFullYear(),
        });
        setBookFormSuccess('New book published to Indie Picks catalogue!');
      }

      resetBookForm();
      setActiveTab('books');
      setTimeout(() => setBookFormSuccess(null), 4000);
    } catch (err: unknown) {
      setBookFormError(err instanceof Error ? err.message : 'Error saving book.');
    }
  };

  const startEditBook = (book: Book) => {
    setEditingBookId(book.id);
    setTitle(book.title);
    setSubtitle(book.subtitle || '');
    setGenre(book.genre);
    setTagsInput((book.tags || []).join(', '));
    setSynopsis(book.synopsis);
    setCoverUrl(book.coverUrl);
    setPurchaseUrl(book.purchaseUrl);
    setPurchaseRetailerName(book.purchaseRetailerName || 'Bookshop.org');
    setPageCount(book.pageCount);
    setPublishedYear(book.publishedYear);
    setActiveTab('add-book');
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    const words = countWords(profileBio);
    if (words > 150) {
      setProfileError(`Bio exceeds 150 words limit (${words} words). Please condense.`);
      return;
    }

    try {
      onUpdateProfile(currentUser.id, {
        name: profileName.trim(),
        penName: profilePenName.trim(),
        avatarUrl: profileAvatarUrl.trim(),
        bio: profileBio.trim(),
        websiteUrl: profileWebsite.trim() || undefined,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Error updating profile');
    }
  };

  const handleSendReply = (qId: string) => {
    const text = replyTextMap[qId];
    if (!text || !text.trim()) return;
    onAnswerQuestion(qId, text);
    setReplyTextMap((prev) => ({ ...prev, [qId]: '' }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Studio Header */}
      <div className="rounded-2xl border border-[#E5DEC9] bg-[#F7F3EA] p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B2741E]">
                Indie Author Studio
              </span>
              <span className="text-xs text-[#8C7E70]">· 100% Free discovery</span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#2C2621] mt-1">
              Welcome, {currentUser.name}
            </h1>
            <p className="text-xs text-[#6B5E51] mt-1">
              Manage your published books, respond to inquisitive readers, and share direct purchase links.
            </p>
          </div>

          <button
            onClick={() => {
              resetBookForm();
              setActiveTab('add-book');
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2C2621] px-4 py-2.5 text-xs font-semibold text-[#FAF8F5] hover:bg-[#3E362F] transition shadow-xs self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-[#D99B3B]" />
            <span>Publish New Book</span>
          </button>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="mt-8 border-t border-[#DDD5C5] pt-4 flex items-center gap-3 sm:gap-6 flex-wrap">
          <button
            onClick={() => setActiveTab('books')}
            className={`text-xs font-semibold pb-1 transition relative ${
              activeTab === 'books'
                ? 'text-[#2C2621] border-b-2 border-[#B2741E]'
                : 'text-[#7A6F64] hover:text-[#2C2621]'
            }`}
          >
            My Books ({myBooks.length})
          </button>
          <button
            onClick={() => {
              resetBookForm();
              setActiveTab('add-book');
            }}
            className={`text-xs font-semibold pb-1 transition relative ${
              activeTab === 'add-book'
                ? 'text-[#2C2621] border-b-2 border-[#B2741E]'
                : 'text-[#7A6F64] hover:text-[#2C2621]'
            }`}
          >
            {editingBookId ? 'Edit Book' : 'Add Book by URL'}
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`text-xs font-semibold pb-1 transition relative flex items-center gap-1.5 ${
              activeTab === 'qa'
                ? 'text-[#2C2621] border-b-2 border-[#B2741E]'
                : 'text-[#7A6F64] hover:text-[#2C2621]'
            }`}
          >
            <span>Reader Q&A</span>
            {unansweredCount > 0 && (
              <span className="rounded-full bg-[#B2741E] px-1.5 py-0.2 text-[10px] text-white font-bold">
                {unansweredCount} new
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`text-xs font-semibold pb-1 transition relative ${
              activeTab === 'profile'
                ? 'text-[#2C2621] border-b-2 border-[#B2741E]'
                : 'text-[#7A6F64] hover:text-[#2C2621]'
            }`}
          >
            Author Profile & Bio (Max 150 Words)
          </button>
        </div>
      </div>

      {bookFormSuccess && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{bookFormSuccess}</span>
        </div>
      )}

      {/* TAB 1: MY BOOKS */}
      {activeTab === 'books' && (
        <div className="space-y-6">
          {myBooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DDD5C5] bg-[#FAF8F5] p-12 text-center">
              <BookOpen className="w-10 h-10 text-[#8C7E70] mx-auto mb-3" />
              <h3 className="font-serif text-lg font-bold text-[#2C2621]">
                No books added yet
              </h3>
              <p className="text-xs text-[#7A6F64] max-w-md mx-auto mt-1 mb-6">
                Publish your first title to Indie Picks. Add your cover via image URL, set purchase links, and connect with readers worldwide.
              </p>
              <button
                onClick={() => setActiveTab('add-book')}
                className="rounded-lg bg-[#2C2621] px-4 py-2 text-xs font-semibold text-[#FAF8F5]"
              >
                Publish Book Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myBooks.map((book) => {
                const stats = calculateBookStats(book, reviews, shelves);
                return (
                  <div
                    key={book.id}
                    className="rounded-xl border border-[#E5DEC9] bg-[#FAF8F5] p-4 flex flex-col justify-between shadow-xs hover:border-[#C8BC9F] transition"
                  >
                    <div className="flex gap-4">
                      {/* Cover thumbnail */}
                      <div className="w-20 aspect-2/3 rounded-md overflow-hidden bg-[#EFE8D8] flex-shrink-0 book-spine">
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-medium text-[#8C5D17]">
                          {book.genre} · {book.publishedYear}
                        </div>
                        <h3 className="font-serif text-base font-bold text-[#2C2621] truncate">
                          {book.title}
                        </h3>
                        {book.subtitle && (
                          <p className="text-xs text-[#7A6F64] italic truncate">
                            {book.subtitle}
                          </p>
                        )}

                        {/* Direct purchase link */}
                        <a
                          href={book.purchaseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#7A5418] hover:underline"
                        >
                          <span>{book.purchaseRetailerName || 'Purchase Link'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Stats metrics */}
                    <div className="mt-4 pt-3 border-t border-[#EFE8D8] grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="block font-bold text-[#2C2621]">
                          {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
                        </span>
                        <span className="text-[10px] text-[#8C7E70]">★ Rating</span>
                      </div>
                      <div>
                        <span className="block font-bold text-[#2C2621]">{stats.reviewsCount}</span>
                        <span className="text-[10px] text-[#8C7E70]">Reviews</span>
                      </div>
                      <div>
                        <span className="block font-bold text-[#2C2621]">{stats.shelvesCount}</span>
                        <span className="text-[10px] text-[#8C7E70]">Shelved</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-[#EFE8D8] flex items-center justify-between">
                      <button
                        onClick={() => onViewBook(book)}
                        className="inline-flex items-center gap-1 text-xs text-[#5C4F42] hover:text-[#2C2621]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditBook(book)}
                          className="p-1.5 text-[#5C4F42] hover:text-[#2C2621] rounded-md hover:bg-[#EFE8D8]"
                          title="Edit Book Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
                              onDeleteBook(book.id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:text-red-800 rounded-md hover:bg-red-50"
                          title="Delete Book"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ADD / EDIT BOOK */}
      {activeTab === 'add-book' && (
        <div className="rounded-2xl border border-[#E5DEC9] bg-[#FAF8F5] p-6 sm:p-8 max-w-3xl">
          <div className="mb-6">
            <h2 className="font-serif text-2xl font-bold text-[#2C2621]">
              {editingBookId ? 'Edit Book Details' : 'Publish Book via Image URL'}
            </h2>
            <p className="text-xs text-[#7A6F64] mt-1">
              No files are uploaded to protect Firebase realtime database quotas. Enter a direct web image URL for your cover and a purchase destination.
            </p>
          </div>

          {bookFormError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{bookFormError}</span>
            </div>
          )}

          <form onSubmit={handleBookSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#3E362F] mb-1">
                  Book Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Clockwork Cartographer"
                  className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-2.5 text-xs text-[#2C2621]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#3E362F] mb-1">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. A Novel of Uncharted Gears"
                  className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-2.5 text-xs text-[#2C2621]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[#3E362F] mb-1">
                  Genre *
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-2.5 text-xs text-[#2C2621]"
                >
                  <option value="Fantasy">Fantasy</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Literary Fiction">Literary Fiction</option>
                  <option value="Mystery & Thriller">Mystery & Thriller</option>
                  <option value="Romance">Romance</option>
                  <option value="Horror">Horror</option>
                  <option value="Poetry">Poetry</option>
                  <option value="Historical">Historical</option>
                  <option value="Memoir & Essays">Memoir & Essays</option>
                  <option value="Cyberpunk">Cyberpunk</option>
                  <option value="Slice of Life">Slice of Life</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#3E362F] mb-1">
                  Page Count
                </label>
                <input
                  type="number"
                  value={pageCount}
                  onChange={(e) => setPageCount(Number(e.target.value))}
                  min={1}
                  className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-2.5 text-xs text-[#2C2621]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#3E362F] mb-1">
                  Publication Year
                </label>
                <input
                  type="number"
                  value={publishedYear}
                  onChange={(e) => setPublishedYear(Number(e.target.value))}
                  min={1900}
                  max={2030}
                  className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-2.5 text-xs text-[#2C2621]"
                />
              </div>
            </div>

            {/* Book Cover URL (Strictly URL, No file upload) */}
            <div className="rounded-xl border border-[#E5DEC9] bg-[#F7F3EA] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#B2741E]" />
                <span className="font-semibold text-[#2C2621]">
                  Book Cover Image URL * (No file upload)
                </span>
              </div>
              <p className="text-[11px] text-[#7A6F64]">
                Host your book cover image on your own website, Unsplash, Imgur, or GitHub, and paste the direct HTTP/HTTPS link here.
              </p>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or https://yourdomain.com/cover.jpg"
                className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-2.5 text-xs text-[#2C2621]"
                required
              />

              {coverUrl && isValidImageUrl(coverUrl) && (
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-16 aspect-2/3 rounded-md overflow-hidden bg-white border border-[#DDD5C5]">
                    <img
                      src={coverUrl}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={() => setBookFormError('Cover image failed to load. Please check the URL.')}
                    />
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    ✓ Valid image preview detected
                  </span>
                </div>
              )}
            </div>

            {/* Purchase Redirect Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#3E362F] mb-1">
                  Purchase Redirect URL *
                </label>
                <input
                  type="url"
                  value={purchaseUrl}
                  onChange={(e) => setPurchaseUrl(e.target.value)}
                  placeholder="https://bookshop.org/p/... or https://amazon.com/..."
                  className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-2.5 text-xs text-[#2C2621]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#3E362F] mb-1">
                  Retailer Name / Label
                </label>
                <input
                  type="text"
                  value={purchaseRetailerName}
                  onChange={(e) => setPurchaseRetailerName(e.target.value)}
                  placeholder="e.g. Bookshop.org, Amazon, Author Webshop"
                  className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-2.5 text-xs text-[#2C2621]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#3E362F] mb-1">
                Themes & Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Steampunk, Exploration, Nature, Small Town"
                className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-2.5 text-xs text-[#2C2621]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#3E362F] mb-1">
                Synopsis / Book Description *
              </label>
              <textarea
                rows={4}
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="Write an enticing, atmospheric description of your book..."
                className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-3 text-xs text-[#2C2621]"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DDD5C5]">
              <button
                type="button"
                onClick={resetBookForm}
                className="px-4 py-2 text-xs text-[#7A6F64] hover:text-[#2C2621]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#2C2621] px-5 py-2.5 text-xs font-semibold text-[#FAF8F5] hover:bg-[#3E362F] transition shadow-xs"
              >
                {editingBookId ? 'Save Changes' : 'Publish to Catalogue'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: READER Q&A INBOX */}
      {activeTab === 'qa' && (
        <div className="space-y-6 max-w-4xl">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#2C2621]">
              Reader Inquiries & Questions
            </h2>
            <p className="text-xs text-[#7A6F64] mt-0.5">
              Reply directly to readers. Your answers will be highlighted on your author profile and book page.
            </p>
          </div>

          {myQuestions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#DDD5C5] bg-[#FAF8F5] p-10 text-center">
              <HelpCircle className="w-8 h-8 text-[#8C7E70] mx-auto mb-2" />
              <p className="text-xs text-[#7A6F64]">
                No reader questions yet. As readers explore your books, their questions will arrive here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myQuestions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-[#E5DEC9] bg-[#FAF8F5] p-5 text-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={q.askerAvatar}
                        alt={q.askerName}
                        className="w-7 h-7 rounded-full object-cover border border-[#D5C9B3]"
                      />
                      <div>
                        <span className="font-semibold text-[#2C2621]">{q.askerName}</span>
                        {q.bookTitle && (
                          <span className="text-[11px] text-[#8C5D17] ml-2">
                            about <em>{q.bookTitle}</em>
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#8C7E70]">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="font-serif italic text-sm text-[#3E362F] pl-9">
                    "{q.questionText}"
                  </p>

                  {/* Existing Answer or Reply Editor */}
                  {q.answerText ? (
                    <div className="ml-9 p-3 rounded-lg bg-[#F7F3EA] border-l-2 border-[#D99B3B] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[11px] text-[#8C5D17]">
                          Your Published Reply
                        </span>
                        {q.answeredAt && (
                          <span className="text-[10px] text-[#8C7E70]">
                            {new Date(q.answeredAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-[#4D4135]">{q.answerText}</p>
                    </div>
                  ) : (
                    <div className="ml-9 space-y-2 pt-1">
                      <textarea
                        rows={2}
                        value={replyTextMap[q.id] || ''}
                        onChange={(e) =>
                          setReplyTextMap({ ...replyTextMap, [q.id]: e.target.value })
                        }
                        placeholder="Type your author answer here..."
                        className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-2.5 text-xs text-[#2C2621]"
                      />
                      <button
                        onClick={() => handleSendReply(q.id)}
                        className="rounded-lg bg-[#2C2621] px-3.5 py-1.5 text-xs font-semibold text-[#FAF8F5] hover:bg-[#3E362F] transition"
                      >
                        Publish Reply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUTHOR PROFILE & BIO (Max 150 Words) */}
      {activeTab === 'profile' && (
        <div className="rounded-2xl border border-[#E5DEC9] bg-[#FAF8F5] p-6 sm:p-8 max-w-2xl">
          <div className="mb-6">
            <h2 className="font-serif text-2xl font-bold text-[#2C2621]">
              Author Profile & Bio
            </h2>
            <p className="text-xs text-[#7A6F64] mt-1">
              Keep your bio under 150 words to maintain a clean, literary presentation.
            </p>
          </div>

          {profileSuccess && (
            <div className="mb-4 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
              ✓ Author profile updated successfully!
            </div>
          )}

          {profileError && (
            <div className="mb-4 text-xs font-medium text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#3E362F] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-2.5 text-xs text-[#2C2621]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#3E362F] mb-1">
                  Pen Name / Publishing Moniker
                </label>
                <input
                  type="text"
                  value={profilePenName}
                  onChange={(e) => setProfilePenName(e.target.value)}
                  className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-2.5 text-xs text-[#2C2621]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#3E362F] mb-1">
                Profile Photo URL (Image URL only)
              </label>
              <input
                type="url"
                value={profileAvatarUrl}
                onChange={(e) => setProfileAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or hosted picture URL"
                className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-2.5 text-xs text-[#2C2621]"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-[#3E362F]">
                  Author Bio (Max 150 words)
                </label>
                <span
                  className={`text-[11px] font-semibold ${
                    currentBioWords > 150 ? 'text-red-600' : 'text-[#8C7E70]'
                  }`}
                >
                  {currentBioWords} / 150 words
                </span>
              </div>
              <textarea
                rows={4}
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Write your author story, literary background, or creative mission..."
                className={`w-full rounded-lg border p-3 text-xs text-[#2C2621] ${
                  currentBioWords > 150 ? 'border-red-400 bg-red-50/30' : 'border-[#DDD5C5] bg-[#FAF8F5]'
                }`}
                required
              />
              {currentBioWords > 150 && (
                <p className="mt-1 text-[11px] text-red-600">
                  Please remove {currentBioWords - 150} words to stay within the 150-word indie limit.
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-[#3E362F] mb-1">
                Official Website or Store URL
              </label>
              <input
                type="url"
                value={profileWebsite}
                onChange={(e) => setProfileWebsite(e.target.value)}
                placeholder="https://masoncarterbooks.example.com"
                className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-2.5 text-xs text-[#2C2621]"
              />
            </div>

            <button
              type="submit"
              disabled={currentBioWords > 150}
              className="mt-2 rounded-lg bg-[#2C2621] px-5 py-2.5 text-xs font-semibold text-[#FAF8F5] hover:bg-[#3E362F] transition disabled:opacity-50"
            >
              Update Author Profile
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
