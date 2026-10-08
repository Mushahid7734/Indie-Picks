import React, { useState } from 'react';
import { User, Book, ShelfItem, CuratedList, ShelfStatus, Review } from '../types';
import { BookCard } from './BookCard';
import {
  Bookmark,
  BookOpen,
  CheckCircle,
  PlusCircle,
  ListPlus,
  Trash2,
  Heart,
  Share2,
  Check,
  Clock,
  Sparkles,
  Users,
} from 'lucide-react';
import { ReadingProgressBar } from './ReadingProgressBar';

interface ReaderDashboardProps {
  currentUser: User;
  books: Book[];
  shelves: ShelfItem[];
  reviews: Review[];
  curatedLists: CuratedList[];
  allUsers?: User[];
  onSelectBook: (book: Book) => void;
  onSelectAuthor: (authorId: string) => void;
  onShelfChange: (bookId: string, status: ShelfStatus | 'remove') => void;
  onCreateCuratedList: (title: string, description: string, bookIds: string[]) => void;
  onUpdateProfile: (userId: string, data: Partial<User>) => void;
  onUpdateProgress?: (bookId: string, page: number, status: string) => void;
  onToggleFollowUser?: (targetUserId: string) => void;
}

export const ReaderDashboard: React.FC<ReaderDashboardProps> = ({
  currentUser,
  books,
  shelves,
  reviews,
  curatedLists,
  allUsers = [],
  onSelectBook,
  onSelectAuthor,
  onShelfChange,
  onCreateCuratedList,
  onUpdateProfile,
  onUpdateProgress,
  onToggleFollowUser,
}) => {
  const [activeTab, setActiveTab] = useState<'shelves' | 'my-lists' | 'new-list'>('shelves');
  const [shelfFilter, setShelfFilter] = useState<ShelfStatus>('want_to_read');

  // Create List form
  const [listTitle, setListTitle] = useState('');
  const [listDesc, setListDesc] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [listCreatedNotice, setListCreatedNotice] = useState(false);

  const userShelves = shelves.filter((s) => s.userId === currentUser.id);
  const myCuratedLists = curatedLists.filter((l) => l.creatorId === currentUser.id);

  const filteredShelves = userShelves.filter((s) => s.status === shelfFilter);
  const shelfBooks = filteredShelves
    .map((s) => books.find((b) => b.id === s.bookId))
    .filter((b): b is Book => Boolean(b));

  const handleToggleBookInList = (bookId: string) => {
    setSelectedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listTitle.trim() || selectedBookIds.length === 0) return;
    onCreateCuratedList(listTitle, listDesc, selectedBookIds);
    setListTitle('');
    setListDesc('');
    setSelectedBookIds([]);
    setListCreatedNotice(true);
    setActiveTab('my-lists');
    setTimeout(() => setListCreatedNotice(false), 4000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Reader Header */}
      <div className="rounded-2xl border border-[#E5DEC9] bg-[#F7F3EA] p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#D8CFBF]"
            />
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B2741E]">
                Reader Sanctuary
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2621]">
                {currentUser.name}
              </h1>
              <p className="text-xs text-[#7A6F64] mt-0.5">
                {userShelves.length} books shelved · {myCuratedLists.length} curated lists created
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-[#5C4F42]">
                <span className="font-semibold text-[#8C5D17]">
                  {currentUser.followerCount || 0} Followers
                </span>
                <span className="text-[#C5BBA9]">·</span>
                <span>
                  {(currentUser.followingUserIds || []).length} Following
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('new-list')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2C2621] px-4 py-2.5 text-xs font-semibold text-[#FAF8F5] hover:bg-[#3E362F] transition self-start sm:self-auto shadow-xs"
          >
            <ListPlus className="w-4 h-4 text-[#D99B3B]" />
            <span>Create Book List</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 border-t border-[#DDD5C5] pt-4 flex items-center gap-6">
          <button
            onClick={() => setActiveTab('shelves')}
            className={`text-xs font-semibold pb-1 transition relative ${
              activeTab === 'shelves'
                ? 'text-[#2C2621] border-b-2 border-[#B2741E]'
                : 'text-[#7A6F64] hover:text-[#2C2621]'
            }`}
          >
            My Reading Shelves ({userShelves.length})
          </button>
          <button
            onClick={() => setActiveTab('my-lists')}
            className={`text-xs font-semibold pb-1 transition relative ${
              activeTab === 'my-lists'
                ? 'text-[#2C2621] border-b-2 border-[#B2741E]'
                : 'text-[#7A6F64] hover:text-[#2C2621]'
            }`}
          >
            My Curated Lists ({myCuratedLists.length})
          </button>
          <button
            onClick={() => setActiveTab('new-list')}
            className={`text-xs font-semibold pb-1 transition relative ${
              activeTab === 'new-list'
                ? 'text-[#2C2621] border-b-2 border-[#B2741E]'
                : 'text-[#7A6F64] hover:text-[#2C2621]'
            }`}
          >
            + Create New List
          </button>
        </div>
      </div>

      {listCreatedNotice && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Curated list published! Popular lists automatically display on Explore.</span>
        </div>
      )}

      {/* TAB 1: READING SHELVES */}
      {activeTab === 'shelves' && (
        <div>
          {/* Shelf Switcher (Segmented Controls) */}
          <div className="flex items-center gap-2 mb-6 p-1 bg-[#EAE2D2] rounded-xl w-fit">
            <button
              onClick={() => setShelfFilter('want_to_read')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition ${
                shelfFilter === 'want_to_read'
                  ? 'bg-[#FAF8F5] text-[#2C2621] font-bold shadow-xs'
                  : 'text-[#6B5E51] hover:text-[#2C2621]'
              }`}
            >
              To Read ({userShelves.filter((s) => s.status === 'want_to_read').length})
            </button>
            <button
              onClick={() => setShelfFilter('reading')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition ${
                shelfFilter === 'reading'
                  ? 'bg-[#FAF8F5] text-[#2C2621] font-bold shadow-xs'
                  : 'text-[#6B5E51] hover:text-[#2C2621]'
              }`}
            >
              Currently Reading ({userShelves.filter((s) => s.status === 'reading').length})
            </button>
            <button
              onClick={() => setShelfFilter('finished')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition ${
                shelfFilter === 'finished'
                  ? 'bg-[#FAF8F5] text-[#2C2621] font-bold shadow-xs'
                  : 'text-[#6B5E51] hover:text-[#2C2621]'
              }`}
            >
              Finished ({userShelves.filter((s) => s.status === 'finished').length})
            </button>
          </div>

          {shelfBooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DDD5C5] bg-[#FAF8F5] p-12 text-center">
              <Bookmark className="w-8 h-8 text-[#8C7E70] mx-auto mb-2" />
              <p className="text-sm text-[#6B5E51]">
                No books currently in this shelf. Browse the catalogue or Explore tab to add indie books.
              </p>
            </div>
          ) : shelfFilter === 'reading' ? (
            /* CURRENTLY READING VIEW: Cards with Reading Progress Bars (Page & 200-word status) */
            <div className="space-y-6">
              <div className="rounded-xl bg-[#EFE8D8] p-4 text-xs text-[#5C4F42] flex items-center justify-between">
                <span className="font-semibold text-[#2C2621]">
                  Active Reading Progress: {shelfBooks.length} / 3 books allowed
                </span>
                <span className="text-[11px] text-[#7A6F64]">
                  Update your current page & status notes anytime.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shelfBooks.map((book) => {
                  const item = userShelves.find((s) => s.bookId === book.id && s.status === 'reading');
                  return (
                    <div key={book.id} className="space-y-3">
                      <BookCard
                        book={book}
                        reviews={reviews}
                        shelves={shelves}
                        currentUserId={currentUser.id}
                        onSelectBook={onSelectBook}
                        onSelectAuthor={onSelectAuthor}
                        onShelfChange={onShelfChange}
                      />
                      <ReadingProgressBar
                        book={book}
                        shelfItem={item}
                        currentUser={currentUser}
                        onUpdateProgress={onUpdateProgress}
                        onOpenBook={onSelectBook}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {shelfBooks.map((book) => (
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
        </div>
      )}

      {/* TAB 2: MY CURATED LISTS */}
      {activeTab === 'my-lists' && (
        <div className="space-y-6">
          {myCuratedLists.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DDD5C5] bg-[#FAF8F5] p-12 text-center">
              <ListPlus className="w-8 h-8 text-[#8C7E70] mx-auto mb-2" />
              <h3 className="font-serif text-lg font-bold text-[#2C2621]">
                You haven't made any curated lists yet
              </h3>
              <p className="text-xs text-[#7A6F64] mt-1 mb-4">
                Create themed collections (e.g. "Warm Rainy Day Reads", "Undiscovered Sci-Fi"). Popular lists appear on the Explore tab!
              </p>
              <button
                onClick={() => setActiveTab('new-list')}
                className="rounded-lg bg-[#2C2621] px-4 py-2 text-xs font-semibold text-[#FAF8F5]"
              >
                Create First List
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myCuratedLists.map((list) => {
                const listBooks = list.bookIds
                  .map((id) => books.find((b) => b.id === id))
                  .filter((b): b is Book => Boolean(b));

                return (
                  <div
                    key={list.id}
                    className="rounded-xl border border-[#E5DEC9] bg-[#FAF8F5] p-5 space-y-4 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#7A6F64] mb-1">
                        <span>{listBooks.length} Books</span>
                        <div className="flex items-center gap-1 text-[#B2741E]">
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          <span>{list.likesCount} upvotes</span>
                        </div>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-[#2C2621]">
                        {list.title}
                      </h3>
                      <p className="text-xs text-[#5C4F42] mt-1 leading-relaxed">
                        {list.description}
                      </p>
                    </div>

                    {/* Book Cover Previews */}
                    <div className="flex items-center gap-2 overflow-x-auto py-2">
                      {listBooks.map((b) => (
                        <div
                          key={b.id}
                          onClick={() => onSelectBook(b)}
                          className="w-14 aspect-2/3 rounded-sm overflow-hidden flex-shrink-0 cursor-pointer book-spine hover:opacity-90"
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
          )}
        </div>
      )}

      {/* TAB 3: CREATE NEW CURATED LIST */}
      {activeTab === 'new-list' && (
        <div className="rounded-2xl border border-[#E5DEC9] bg-[#FAF8F5] p-6 sm:p-8 max-w-3xl">
          <div className="mb-6">
            <h2 className="font-serif text-2xl font-bold text-[#2C2621]">
              Create a Curated Book List
            </h2>
            <p className="text-xs text-[#7A6F64] mt-1">
              Assemble a themed collection. Community favorites are showcased directly on the Explore tab!
            </p>
          </div>

          <form onSubmit={handleCreateList} className="space-y-5 text-xs">
            <div>
              <label className="block font-semibold text-[#3E362F] mb-1">
                List Title *
              </label>
              <input
                type="text"
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
                placeholder="e.g. Hidden Speculative Gems That Deserve A Million Readers"
                className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-2.5 text-xs text-[#2C2621]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[#3E362F] mb-1">
                Description & Theme *
              </label>
              <textarea
                rows={3}
                value={listDesc}
                onChange={(e) => setListDesc(e.target.value)}
                placeholder="Why are these books special? What mood or atmosphere unites them?..."
                className="w-full rounded-lg border border-[#DDD5C5] bg-[#FAF8F5] p-2.5 text-xs text-[#2C2621]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[#3E362F] mb-2">
                Select Books to Include ({selectedBookIds.length} selected) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-3 bg-[#F7F3EA] rounded-xl border border-[#DDD5C5]">
                {books.map((b) => {
                  const isSelected = selectedBookIds.includes(b.id);
                  return (
                    <div
                      key={b.id}
                      onClick={() => handleToggleBookInList(b.id)}
                      className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition ${
                        isSelected
                          ? 'border-[#B2741E] bg-[#EFE8D8]'
                          : 'border-[#E5DEC9] bg-[#FAF8F5] hover:bg-white'
                      }`}
                    >
                      <div className="w-8 aspect-2/3 rounded-xs overflow-hidden flex-shrink-0 bg-stone-200">
                        <img
                          src={b.coverUrl}
                          alt={b.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block font-semibold text-[11px] truncate text-[#2C2621]">
                          {b.title}
                        </span>
                        <span className="text-[10px] text-[#7A6F64] block truncate">
                          {b.authorName}
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-[#B2741E] border-[#B2741E] text-white'
                            : 'border-[#C5BBA9]'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DDD5C5]">
              <button
                type="button"
                onClick={() => setActiveTab('my-lists')}
                className="px-4 py-2 text-xs text-[#7A6F64] hover:text-[#2C2621]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={selectedBookIds.length === 0}
                className="rounded-lg bg-[#2C2621] px-5 py-2 text-xs font-semibold text-[#FAF8F5] hover:bg-[#3E362F] transition disabled:opacity-50"
              >
                Publish Curated List
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
