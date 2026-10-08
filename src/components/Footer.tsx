import React from 'react';
import { BookOpen, Feather, Sparkles, Database } from 'lucide-react';

interface FooterProps {
  onNavigateMasonCarter: () => void;
  onOpenFirebaseModal: () => void;
  onNavigateExplore?: () => void;
  onNavigateCatalogue?: () => void;
  onNavigateLists?: () => void;
  onNavigateAuthors?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateMasonCarter,
  onOpenFirebaseModal,
  onNavigateExplore,
  onNavigateCatalogue,
  onNavigateLists,
  onNavigateAuthors,
}) => {
  return (
    <footer className="border-t border-[#E8E1D3] bg-[#F5F0E6] text-[#4D4135] pt-10 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Brand & Literary Vision */}
          <div className="md:col-span-5 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2C2621] text-[#D99B3B] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-lg text-[#2C2621]">
                Indie Picks
              </span>
            </div>
            <p className="font-serif text-xs text-[#5C4F42] leading-relaxed max-w-sm">
              A curated home celebrating independent authors, passionate readers, and authentic self-published literature.
            </p>
          </div>

          {/* Featured Author & Exploration */}
          <div className="md:col-span-4 space-y-2 text-xs">
            <h4 className="font-serif font-bold text-sm text-[#2C2621] mb-2.5">
              Explore Stories
            </h4>
            <div className="flex flex-col gap-1.5 text-[#5C4F42]">
              <button
                onClick={onNavigateMasonCarter}
                className="inline-flex items-center gap-1.5 text-left hover:text-[#B2741E] font-medium"
              >
                <Feather className="w-3.5 h-3.5 text-[#B2741E]" />
                <span>Featured Author: Mason Carter</span>
              </button>
              {onNavigateExplore && (
                <button
                  onClick={onNavigateExplore}
                  className="text-left hover:text-[#B2741E]"
                >
                  Weekly Algorithmic Picks
                </button>
              )}
              {onNavigateCatalogue && (
                <button
                  onClick={onNavigateCatalogue}
                  className="text-left hover:text-[#B2741E]"
                >
                  Full Book Catalogue
                </button>
              )}
            </div>
          </div>

          {/* Community & Connection */}
          <div className="md:col-span-3 space-y-2 text-xs">
            <h4 className="font-serif font-bold text-sm text-[#2C2621] mb-2.5">
              Community
            </h4>
            <div className="flex flex-col gap-1.5 text-[#5C4F42]">
              {onNavigateLists && (
                <button
                  onClick={onNavigateLists}
                  className="text-left hover:text-[#B2741E]"
                >
                  Reader Curated Lists
                </button>
              )}
              {onNavigateAuthors && (
                <button
                  onClick={onNavigateAuthors}
                  className="text-left hover:text-[#B2741E]"
                >
                  Independent Authors Directory
                </button>
              )}
              <button
                onClick={onOpenFirebaseModal}
                className="inline-flex items-center gap-1 text-left text-[#8C7E70] hover:text-[#2C2621]"
              >
                <Database className="w-3 h-3 text-[#B2741E]" />
                <span>Realtime Data Sync</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#DDD5C5] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#7A6F64]">
          <p>© {new Date().getFullYear()} Indie Picks · Dedicated to independent writers and avid readers.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateMasonCarter}
              className="hover:text-[#2C2621] font-semibold text-[#8C5D17] hover:underline flex items-center gap-1"
            >
              <Feather className="w-3 h-3 text-[#B2741E]" />
              <span>Developer: Mason Carter | Author</span>
            </button>
            <span aria-hidden="true" className="text-[#C5BBA9]">·</span>
            <button onClick={onOpenFirebaseModal} className="hover:text-[#2C2621] underline">
              Database Sync
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

