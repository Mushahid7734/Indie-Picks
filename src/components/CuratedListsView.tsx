import React, { useState } from 'react';
import { CuratedList, Book, User } from '../types';
import { Heart, PlusCircle, BookOpen, Share2, Check } from 'lucide-react';

interface CuratedListsViewProps {
  lists: CuratedList[];
  books: Book[];
  currentUser: User;
  onSelectBook: (book: Book) => void;
  onToggleLikeList: (listId: string) => void;
  onOpenCreateList: () => void;
}

export const CuratedListsView: React.FC<CuratedListsViewProps> = ({
  lists,
  books,
  currentUser,
  onSelectBook,
  onToggleLikeList,
  onOpenCreateList,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sorted by popular likes first
  const sortedLists = [...lists].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));

  const handleShareList = (listId: string) => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedId(listId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#2C2621]">
            Reader-Curated Lists
          </h1>
          <p className="text-xs text-[#7A6F64] mt-1">
            Collections created by community readers. Upvoted favorites automatically graduate to the Explore tab!
          </p>
        </div>

        <button
          onClick={onOpenCreateList}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2C2621] px-4 py-2.5 text-xs font-semibold text-[#FAF8F5] hover:bg-[#3E362F] transition shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-[#D99B3B]" />
          <span>Curate a New List</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedLists.map((list) => {
          const isLiked = list.likedByUserIds.includes(currentUser.id);
          const listBooks = list.bookIds
            .map((id) => books.find((b) => b.id === id))
            .filter((b): b is Book => Boolean(b));

          return (
            <div
              key={list.id}
              className="rounded-2xl border border-[#E5DEC9] bg-[#FAF8F5] p-6 space-y-4 shadow-xs hover:border-[#C8BC9F] transition flex flex-col justify-between"
            >
              <div>
                {/* Creator Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
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
                      <span className="text-[10px] text-[#8C7E70] block">
                        {listBooks.length} Books Curated
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShareList(list.id)}
                      className="p-1.5 text-[#7A6F64] hover:text-[#2C2621] rounded-full hover:bg-[#EFE8D8] transition"
                      title="Share List"
                    >
                      {copiedId === list.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onToggleLikeList(list.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                        isLiked
                          ? 'bg-[#B2741E] text-white'
                          : 'bg-[#EFE8D8] text-[#5C4F42] hover:bg-[#E5DEC9]'
                      }`}
                      title="Upvote this list"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{list.likesCount}</span>
                    </button>
                  </div>
                </div>

                <h2 className="font-serif text-xl font-bold text-[#2C2621]">
                  {list.title}
                </h2>
                <p className="text-xs text-[#5C4F42] mt-1.5 leading-relaxed">
                  {list.description}
                </p>

                {/* Books in this list */}
                <div className="mt-5 grid grid-cols-4 sm:grid-cols-4 gap-3">
                  {listBooks.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => onSelectBook(book)}
                      className="group cursor-pointer text-left"
                    >
                      <div className="w-full aspect-2/3 rounded-md overflow-hidden bg-[#EFE8D8] book-spine transition-transform group-hover:scale-103 mb-1.5 shadow-xs">
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="block font-serif text-[11px] font-bold text-[#2C2621] truncate group-hover:text-[#B2741E]">
                        {book.title}
                      </span>
                      <span className="block text-[10px] text-[#7A6F64] truncate">
                        {book.authorName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
