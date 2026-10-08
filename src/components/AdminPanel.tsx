import React, { useState } from 'react';
import { User, Book, Review, Question, CuratedList, UserRole, ADMIN_EMAIL } from '../types';
import {
  ShieldAlert,
  Trash2,
  BookOpen,
  Users,
  MessageSquare,
  HelpCircle,
  Bookmark,
  Search,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Edit,
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: User;
  books: Book[];
  users: User[];
  reviews: Review[];
  questions: Question[];
  lists: CuratedList[];
  onDeleteBook: (bookId: string) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onDeleteReview: (reviewId: string) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDeleteList: (listId: string) => void;
  onCleanReset: () => void;
  onViewBook: (book: Book) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  books,
  users,
  reviews,
  questions,
  lists,
  onDeleteBook,
  onDeleteUser,
  onUpdateUserRole,
  onDeleteReview,
  onDeleteQuestion,
  onDeleteList,
  onCleanReset,
  onViewBook,
}) => {
  const [activeTab, setActiveTab] = useState<'books' | 'users' | 'reviews' | 'questions' | 'lists'>('books');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.authorName.toLowerCase().includes(search.toLowerCase()) ||
      b.genre.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.penName && u.penName.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredReviews = reviews.filter(
    (r) =>
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase())
  );

  const filteredQuestions = questions.filter(
    (q) =>
      q.askerName.toLowerCase().includes(search.toLowerCase()) ||
      q.questionText.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLists = lists.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.creatorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-stone-900 to-stone-800 text-stone-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                <ShieldAlert className="w-3.5 h-3.5" />
                Super Admin Panel
              </span>
              <span className="text-xs text-stone-300 font-mono">
                {ADMIN_EMAIL} (Mason Carter)
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-white mt-2">
              Indie Picks Moderation Center
            </h1>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl">
              Full administrative oversight to delete spam books, manage registered authors/readers, remove abusive reviews, and protect the indie ecosystem.
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm('Reset catalogue and clear all test data? Mason Carter will remain intact.')) {
                onCleanReset();
                showNotice('Catalogue reset to clean state with Mason Carter only.');
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-600 bg-stone-800/80 px-4 py-2 text-xs font-semibold text-stone-200 hover:bg-red-950 hover:border-red-600 hover:text-white transition shadow-sm self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Purge All Dummy Data</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 pt-6 border-t border-stone-700/60 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-2.5 rounded-lg bg-stone-800/50">
            <span className="block text-2xl font-bold text-white">{books.length}</span>
            <span className="text-[11px] text-stone-400">Total Books</span>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-800/50">
            <span className="block text-2xl font-bold text-white">
              {users.filter((u) => u.isAuthor).length}
            </span>
            <span className="text-[11px] text-stone-400">Indie Authors</span>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-800/50">
            <span className="block text-2xl font-bold text-white">
              {users.filter((u) => !u.isAuthor).length}
            </span>
            <span className="text-[11px] text-stone-400">Readers</span>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-800/50">
            <span className="block text-2xl font-bold text-white">{reviews.length}</span>
            <span className="text-[11px] text-stone-400">Reviews</span>
          </div>
          <div className="p-2.5 rounded-lg bg-stone-800/50 col-span-2 sm:col-span-1">
            <span className="block text-2xl font-bold text-white">{lists.length}</span>
            <span className="text-[11px] text-stone-400">Curated Lists</span>
          </div>
        </div>
      </div>

      {notice && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Main Moderation Container */}
      <div className="rounded-2xl border border-[#DDD5C5] bg-[#FAF8F5] p-6 shadow-xs">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5DEC9] pb-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('books')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'books'
                  ? 'bg-[#2C2621] text-white'
                  : 'bg-[#EFE8D8] text-[#5C4F42] hover:bg-[#E5DEC9]'
              }`}
            >
              Books ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'users'
                  ? 'bg-[#2C2621] text-white'
                  : 'bg-[#EFE8D8] text-[#5C4F42] hover:bg-[#E5DEC9]'
              }`}
            >
              Users & Authors ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'reviews'
                  ? 'bg-[#2C2621] text-white'
                  : 'bg-[#EFE8D8] text-[#5C4F42] hover:bg-[#E5DEC9]'
              }`}
            >
              Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'questions'
                  ? 'bg-[#2C2621] text-white'
                  : 'bg-[#EFE8D8] text-[#5C4F42] hover:bg-[#E5DEC9]'
              }`}
            >
              Questions ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('lists')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'lists'
                  ? 'bg-[#2C2621] text-white'
                  : 'bg-[#EFE8D8] text-[#5C4F42] hover:bg-[#E5DEC9]'
              }`}
            >
              Lists ({lists.length})
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8C7E70]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search moderation entries..."
              className="w-full rounded-lg border border-[#DDD5C5] bg-white py-1.5 pl-8 pr-3 text-xs text-[#2C2621]"
            />
          </div>
        </div>

        {/* TAB 1: BOOKS MODERATION */}
        {activeTab === 'books' && (
          <div className="space-y-3">
            {filteredBooks.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#8C7E70]">
                No books found. Catalogue is clean.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#DDD5C5] text-[#8C7E70] text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Cover</th>
                      <th className="py-2.5 px-3">Title & Subtitle</th>
                      <th className="py-2.5 px-3">Author</th>
                      <th className="py-2.5 px-3">Genre</th>
                      <th className="py-2.5 px-3">Purchase URL</th>
                      <th className="py-2.5 px-3 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE8D8]">
                    {filteredBooks.map((b) => (
                      <tr key={b.id} className="hover:bg-white/60 transition">
                        <td className="py-2.5 px-3">
                          <img
                            src={b.coverUrl}
                            alt={b.title}
                            className="w-8 aspect-2/3 object-cover rounded-xs border border-[#DDD5C5]"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#2C2621] block">{b.title}</span>
                          {b.subtitle && <span className="text-[10px] text-[#7A6F64]">{b.subtitle}</span>}
                        </td>
                        <td className="py-2.5 px-3 text-[#5C4F42]">{b.authorName}</td>
                        <td className="py-2.5 px-3 text-[#8C5D17]">{b.genre}</td>
                        <td className="py-2.5 px-3">
                          <a
                            href={b.purchaseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#8C5D17] hover:underline inline-flex items-center gap-1"
                          >
                            <span>{b.purchaseRetailerName || 'Retailer'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-2">
                          <button
                            onClick={() => onViewBook(b)}
                            className="text-[11px] font-semibold text-[#5C4F42] hover:text-[#2C2621] underline"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${b.title}" as spam?`)) {
                                onDeleteBook(b.id);
                                showNotice(`Deleted book "${b.title}".`);
                              }
                            }}
                            className="text-[11px] font-semibold text-red-600 hover:text-red-800"
                          >
                            Delete Spam
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: USERS & AUTHORS MODERATION */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#DDD5C5] text-[#8C7E70] text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Bio Preview</th>
                    <th className="py-2.5 px-3 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE8D8]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/60 transition">
                      <td className="py-2.5 px-3 flex items-center gap-2">
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover border border-[#D5C9B3]"
                        />
                        <div>
                          <span className="font-bold text-[#2C2621] block">{u.name}</span>
                          {u.penName && (
                            <span className="text-[10px] text-[#7A6F64]">Pen: {u.penName}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-[#5C4F42] font-mono text-[11px]">{u.email}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            u.isAdmin
                              ? 'bg-red-100 text-red-800'
                              : u.isAuthor
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {u.isAdmin ? 'Admin' : u.isAuthor ? 'Author' : 'Reader'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#7A6F64] max-w-xs truncate">
                        {u.bio || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-2">
                        {!u.isAdmin && (
                          <>
                            <button
                              onClick={() => {
                                const newRole: UserRole = u.isAuthor ? 'reader' : 'author';
                                onUpdateUserRole(u.id, newRole);
                                showNotice(`Updated ${u.name} to ${newRole}.`);
                              }}
                              className="text-[11px] font-semibold text-[#8C5D17] hover:underline"
                            >
                              {u.isAuthor ? 'Demote to Reader' : 'Promote to Author'}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Ban and remove user "${u.name}" and all their books?`)) {
                                  onDeleteUser(u.id);
                                  showNotice(`Banned user "${u.name}".`);
                                }
                              }}
                              className="text-[11px] font-semibold text-red-600 hover:text-red-800"
                            >
                              Ban Spam User
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {filteredReviews.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#8C7E70]">
                No reviews found.
              </div>
            ) : (
              <div className="divide-y divide-[#EFE8D8]">
                {filteredReviews.map((rev) => (
                  <div key={rev.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2C2621]">{rev.userName}</span>
                        <span className="text-[10px] text-amber-700">★ {rev.rating} / 5</span>
                        <span className="text-[10px] text-[#8C7E70]">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[#4D4135] mt-1 leading-relaxed text-xs">{rev.comment}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Delete this review?')) {
                          onDeleteReview(rev.id);
                          showNotice('Review deleted.');
                        }
                      }}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 flex-shrink-0"
                    >
                      Delete Spam Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: QUESTIONS MODERATION */}
        {activeTab === 'questions' && (
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#8C7E70]">
                No questions found.
              </div>
            ) : (
              <div className="divide-y divide-[#EFE8D8]">
                {filteredQuestions.map((q) => (
                  <div key={q.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-bold text-[#2C2621]">{q.askerName} asked:</span>
                      <p className="font-serif italic text-xs text-[#3E362F] mt-0.5">
                        "{q.questionText}"
                      </p>
                      {q.answerText && (
                        <p className="text-[11px] text-[#8C5D17] mt-1">
                          Reply: {q.answerText}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Delete this question?')) {
                          onDeleteQuestion(q.id);
                          showNotice('Question deleted.');
                        }
                      }}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 flex-shrink-0"
                    >
                      Delete Spam Question
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: LISTS MODERATION */}
        {activeTab === 'lists' && (
          <div className="space-y-3">
            {filteredLists.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#8C7E70]">
                No curated lists found.
              </div>
            ) : (
              <div className="divide-y divide-[#EFE8D8]">
                {filteredLists.map((l) => (
                  <div key={l.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2C2621]">{l.title}</span>
                        <span className="text-[10px] text-[#8C7E70]">by {l.creatorName}</span>
                      </div>
                      <p className="text-xs text-[#5C4F42] mt-0.5">{l.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete list "${l.title}"?`)) {
                          onDeleteList(l.id);
                          showNotice('List deleted.');
                        }
                      }}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 flex-shrink-0"
                    >
                      Delete Spam List
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
