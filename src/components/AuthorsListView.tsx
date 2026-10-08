import React from 'react';
import { User, Book, Question } from '../types';
import { Feather, BookOpen, MessageSquare, ArrowRight, Sparkles, Globe, Check, Users } from 'lucide-react';

interface AuthorsListViewProps {
  authors: User[];
  books: Book[];
  questions: Question[];
  currentUser?: User | null;
  onSelectAuthor: (authorId: string) => void;
  onToggleFollowUser?: (targetUserId: string) => void;
}

export const AuthorsListView: React.FC<AuthorsListViewProps> = ({
  authors,
  books,
  questions,
  currentUser,
  onSelectAuthor,
  onToggleFollowUser,
}) => {
  // Put Mason Carter first
  const sortedAuthors = [...authors].sort((a, b) => {
    if (a.isMasonCarter) return -1;
    if (b.isMasonCarter) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#2C2621]">
          Independent Authors Directory
        </h1>
        <p className="text-xs text-[#7A6F64] mt-1">
          Connect directly with self-published writers, follow their author updates, ask questions about their works, and explore their catalogues.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedAuthors.map((author) => {
          const authorBooks = books.filter((b) => b.authorId === author.id);
          const authorQAs = questions.filter((q) => q.authorId === author.id && q.answerText);
          const isFollowing = (currentUser?.followingUserIds || []).includes(author.id);
          const isSelf = currentUser?.id === author.id;

          return (
            <div
              key={author.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all hover:shadow-md ${
                author.isMasonCarter
                  ? 'border-[#D5B876] bg-gradient-to-br from-[#FAF5E8] to-[#FAF8F5] ring-1 ring-[#D5B876]'
                  : 'border-[#E5DEC9] bg-[#FAF8F5] hover:border-[#C8BC9F]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    onClick={() => onSelectAuthor(author.id)}
                    className="flex items-start gap-3 cursor-pointer min-w-0"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={author.avatarUrl}
                        alt={author.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D8CFBF] book-shadow"
                      />
                      {author.isMasonCarter && (
                        <div className="absolute -bottom-1 -right-1 rounded-full bg-[#2C2621] p-1 text-[#D99B3B]" title="Featured Author">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-serif text-base font-bold text-[#2C2621] truncate">
                          {author.name}
                        </h3>
                      </div>
                      {author.penName && author.penName !== author.name && (
                        <p className="text-xs text-[#7A6F64] italic">
                          Writing as {author.penName}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-[#7A6F64]">
                        <span className="font-semibold text-[#8C5D17]">
                          {author.followerCount || 0} followers
                        </span>
                        {author.isMasonCarter && (
                          <span className="text-[10px] font-semibold text-[#8C5D17] bg-[#D99B3B]/20 px-1.5 py-0.2 rounded-xs">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Follow Button */}
                  {!isSelf && onToggleFollowUser && currentUser && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFollowUser(author.id);
                      }}
                      className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        isFollowing
                          ? 'border border-[#B2741E] bg-[#FAF5E8] text-[#8C5D17] hover:bg-[#F2E8D0]'
                          : 'bg-[#2C2621] text-[#FAF8F5] hover:bg-[#3E362F]'
                      }`}
                    >
                      {isFollowing ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-[#B2741E]" />
                          <span>Following</span>
                        </span>
                      ) : (
                        <span>Follow</span>
                      )}
                    </button>
                  )}
                </div>

                {/* Bio (Strictly under 150 words) */}
                <p
                  onClick={() => onSelectAuthor(author.id)}
                  className="font-serif text-xs text-[#5C4F42] leading-relaxed line-clamp-3 cursor-pointer"
                >
                  "{author.bio}"
                </p>

                {/* Book Previews */}
                {authorBooks.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#EFE8D8]">
                    <span className="text-[10px] font-semibold text-[#8C7E70] uppercase tracking-wider block mb-2">
                      Recent Titles
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {authorBooks.slice(0, 3).map((b) => (
                        <div
                          key={b.id}
                          onClick={() => onSelectAuthor(author.id)}
                          className="w-10 aspect-2/3 rounded-xs overflow-hidden bg-stone-200 flex-shrink-0 book-spine cursor-pointer"
                          title={b.title}
                        >
                          <img
                            src={b.coverUrl}
                            alt={b.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {authorBooks.length > 3 && (
                        <span className="text-[11px] text-[#8C7E70] pl-1">
                          +{authorBooks.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Links & Stats */}
              <div
                onClick={() => onSelectAuthor(author.id)}
                className="mt-6 pt-3 border-t border-[#EFE8D8] flex items-center justify-between text-xs text-[#7A6F64] cursor-pointer"
              >
                <span>{authorBooks.length} Books Published</span>
                <span className="inline-flex items-center gap-1 text-[#8C5D17] font-semibold hover:translate-x-1 transition-transform">
                  <span>View Profile & Q&A</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
