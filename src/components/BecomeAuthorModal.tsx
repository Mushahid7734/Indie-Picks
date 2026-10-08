import React, { useState } from 'react';
import { Feather, X, Sparkles, AlertCircle, Check } from 'lucide-react';
import { countWords } from '../lib/storage';

interface BecomeAuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (penName: string, bio: string, websiteUrl?: string) => void;
  currentName: string;
}

export const BecomeAuthorModal: React.FC<BecomeAuthorModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  currentName,
}) => {
  const [penName, setPenName] = useState(currentName);
  const [bio, setBio] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const wordsCount = countWords(bio);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!penName.trim()) {
      setError('Please provide your author or pen name.');
      return;
    }

    if (!bio.trim()) {
      setError('Please provide an author bio.');
      return;
    }

    if (wordsCount > 150) {
      setError(`Author bio cannot exceed 150 words (currently ${wordsCount} words).`);
      return;
    }

    try {
      onUpgrade(penName.trim(), bio.trim(), websiteUrl.trim() || undefined);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upgrade failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2621]/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        className="relative my-8 w-full max-w-md rounded-2xl bg-[#FAF8F5] p-6 sm:p-8 shadow-2xl border border-[#DDD5C5] text-[#2C2621]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-[#EFE8D8] p-1.5 text-[#5C4F42] hover:bg-[#E2D7C2]"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#2C2621] text-[#D99B3B] flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Feather className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2C2621]">
            Become an Indie Author
          </h2>
          <p className="text-xs text-[#7A6F64] mt-1 max-w-xs mx-auto">
            Enlist your self-published books, connect with avid readers, and share direct purchase links.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-[#8C7E70] uppercase tracking-wider mb-1">
              Author / Pen Name
            </label>
            <input
              type="text"
              required
              value={penName}
              onChange={(e) => setPenName(e.target.value)}
              placeholder="e.g. Mason Carter"
              className="w-full rounded-lg border border-[#DDD5C5] bg-[#F5F1E8]/60 p-2.5 text-xs text-[#2C2621] focus:border-[#B2741E] focus:outline-hidden"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-[#8C7E70] uppercase tracking-wider">
                Author Bio
              </label>
              <span
                className={`text-[10px] font-mono ${
                  wordsCount > 150 ? 'text-red-600 font-bold' : 'text-[#8C7E70]'
                }`}
              >
                {wordsCount} / 150 words
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell readers about your writing style, themes, and literary journey..."
              className="w-full rounded-lg border border-[#DDD5C5] bg-[#F5F1E8]/60 p-2.5 text-xs text-[#2C2621] focus:border-[#B2741E] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8C7E70] uppercase tracking-wider mb-1">
              Website or Portfolio Link (Optional)
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full rounded-lg border border-[#DDD5C5] bg-[#F5F1E8]/60 p-2.5 text-xs text-[#2C2621] focus:border-[#B2741E] focus:outline-hidden"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-[#2C2621] py-3 text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] hover:bg-[#3E362F] transition shadow-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#D99B3B]" />
              <span>Register Author Account & Studio</span>
            </button>
            <p className="mt-2 text-[10px] text-[#8C7E70] text-center">
              You can easily toggle between your Reader and Author workspaces at any time.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
