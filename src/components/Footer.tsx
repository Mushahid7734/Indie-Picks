import React from 'react';
import { BookOpen, Feather, Github, Heart, Shield, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigateMasonCarter: () => void;
  onOpenFirebaseModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateMasonCarter,
  onOpenFirebaseModal,
}) => {
  return (
    <footer className="border-t border-[#E8E1D3] bg-[#F5F0E6] text-[#4D4135] pt-12 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          {/* Brand & Mission */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2C2621] text-[#D99B3B] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-lg text-[#2C2621]">
                Indie Picks
              </span>
            </div>
            <p className="font-serif text-xs text-[#5C4F42] leading-relaxed max-w-md">
              A free discovery sanctuary for independent authors and passionate readers. Free forever, zero subscriptions, zero paid tiers, and zero advertising algorithms.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-[#7A6F64]">
              <span className="inline-flex items-center gap-1 text-[#8C5D17] font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Zero Database Waste Architecture:</span>
              </span>
              <span>External Cover URLs keep realtime storage free indefinitely.</span>
            </div>
          </div>

          {/* Special Author Link & Quick Navigation */}
          <div className="md:col-span-3 space-y-2 text-xs">
            <h4 className="font-serif font-bold text-sm text-[#2C2621] mb-3">
              Independent Community
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onNavigateMasonCarter}
                  className="inline-flex items-center gap-1.5 text-[#5C4F42] hover:text-[#B2741E] font-medium"
                >
                  <Feather className="w-3.5 h-3.5 text-[#B2741E]" />
                  <span>Mason Carter's Author Profile</span>
                </button>
              </li>
              <li>
                <span className="text-[#8C7E70]">
                  Automated JavaScript Time Picks
                </span>
              </li>
              <li>
                <span className="text-[#8C7E70]">
                  Open Literary Curation
                </span>
              </li>
            </ul>
          </div>

          {/* GitHub Hosting & PWA */}
          <div className="md:col-span-4 space-y-2 text-xs">
            <h4 className="font-serif font-bold text-sm text-[#2C2621] mb-3">
              Hosting on GitHub Pages
            </h4>
            <p className="text-[#6B5E51] leading-relaxed">
              This app is 100% static-compatible. You can fork it, run <code className="bg-[#EAE2D2] px-1 py-0.5 rounded text-[10px]">npm run build</code>, and host it on GitHub Pages without paying a single penny for hosting or database tiers.
            </p>
            <div className="pt-2 text-[11px] text-[#8C7E70]">
              Installable Progressive Web App (PWA) with offline library caching.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#DDD5C5] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#7A6F64]">
          <p>© {new Date().getFullYear()} Indie Picks · Made for authors, readers, and open literature.</p>
          <div className="flex items-center gap-4">
            <button onClick={onNavigateMasonCarter} className="hover:text-[#2C2621] underline">
              Mason Carter
            </button>
            <button onClick={onOpenFirebaseModal} className="hover:text-[#2C2621] underline">
              Realtime Database Setup
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
