import React, { useState } from 'react';
import { Book, ShelfItem, User } from '../types';
import { countWords } from '../lib/storage';
import { Bookmark, BookOpen, Check, Edit3, MessageSquare, AlertCircle } from 'lucide-react';

interface ReadingProgressBarProps {
  book: Book;
  shelfItem?: ShelfItem;
  currentUser?: User | null;
  onUpdateProgress?: (bookId: string, page: number, status: string) => void;
  onOpenBook?: (book: Book) => void;
  compact?: boolean;
}

export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({
  book,
  shelfItem,
  currentUser,
  onUpdateProgress,
  onOpenBook,
  compact = false,
}) => {
  const isOwner = currentUser && shelfItem && currentUser.id === shelfItem.userId;
  const page = shelfItem?.progressPage || 0;
  const totalPages = book.pageCount || 100;
  const percentage = Math.min(100, Math.max(0, Math.round((page / totalPages) * 100)));

  const [isEditing, setIsEditing] = useState(false);
  const [inputPage, setInputPage] = useState(page);
  const [inputStatus, setInputStatus] = useState(shelfItem?.progressStatus || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const wordCount = countWords(inputStatus);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (wordCount > 200) {
      setErrorMsg(`Progress note cannot exceed 200 words (currently ${wordCount} words).`);
      return;
    }

    try {
      if (onUpdateProgress) {
        onUpdateProgress(book.id, Number(inputPage), inputStatus);
        setSaveSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error updating progress');
    }
  };

  return (
    <div className={`rounded-xl border border-[#E5DEC9] bg-[#FAF8F5] p-3.5 space-y-2.5 ${compact ? 'text-xs' : ''}`}>
      {/* Header info */}
      <div className="flex items-center justify-between text-xs text-[#5C4F42]">
        <div className="flex items-center gap-1.5 font-medium">
          <BookOpen className="w-3.5 h-3.5 text-[#B2741E]" />
          <span>
            Page <strong className="text-[#2C2621]">{page}</strong> of {totalPages}
          </span>
          <span className="text-[#8C7E70]">({percentage}%)</span>
        </div>

        {isOwner && onUpdateProgress && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8C5D17] hover:underline"
          >
            <Edit3 className="w-3 h-3" />
            <span>{isEditing ? 'Cancel' : 'Update'}</span>
          </button>
        )}
      </div>

      {/* Progress Bar Visual */}
      <div className="w-full bg-[#E8E1D3] rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#B2741E] to-[#D99B3B] h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Reader's Status Note (200 words allowed) */}
      {shelfItem?.progressStatus && !isEditing && (
        <div className="rounded-lg bg-[#F4EFE6] p-2.5 text-xs text-[#4D4135] italic leading-relaxed border border-[#E8DFC8]">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-[#8C5D17] not-italic mb-0.5">
            <MessageSquare className="w-3 h-3" />
            <span>Reading status thoughts:</span>
          </div>
          "{shelfItem.progressStatus}"
        </div>
      )}

      {saveSuccess && (
        <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
          <Check className="w-3 h-3" />
          <span>Reading progress updated! Visible to community.</span>
        </p>
      )}

      {/* Edit Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="pt-2 border-t border-[#E5DEC9] space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold uppercase text-[#7A6F64] mb-0.5">
                Current Page
              </label>
              <input
                type="number"
                min="0"
                max={totalPages}
                value={inputPage}
                onChange={(e) => setInputPage(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-md border border-[#D5C9B3] bg-white px-2 py-1 text-xs text-[#2C2621]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase text-[#7A6F64] mb-0.5">
                Total Pages
              </label>
              <input
                type="text"
                value={totalPages}
                disabled
                className="w-full rounded-md border border-[#E5DEC9] bg-[#EFE8D8] px-2 py-1 text-xs text-[#7A6F64]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase text-[#7A6F64] mb-0.5">
              <span>Reading Thoughts & Status</span>
              <span className={wordCount > 200 ? 'text-red-600 font-bold' : ''}>
                {wordCount}/200 words
              </span>
            </div>
            <textarea
              rows={2}
              value={inputStatus}
              onChange={(e) => setInputStatus(e.target.value)}
              placeholder="What are you currently experiencing or thinking about in this chapter? (Max 200 words)"
              className="w-full rounded-md border border-[#D5C9B3] bg-white p-2 text-xs text-[#2C2621] placeholder-[#948779]"
            />
          </div>

          {errorMsg && (
            <p className="text-[11px] text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{errorMsg}</span>
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 text-xs text-[#7A6F64] hover:text-[#2C2621]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#2C2621] px-3.5 py-1 text-xs font-semibold text-[#FAF8F5] hover:bg-[#3E362F]"
            >
              Save Progress
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
