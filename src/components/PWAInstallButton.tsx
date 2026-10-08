import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, X, Sparkles } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`inline-flex items-center gap-2 rounded-lg bg-[#2C2621] text-[#FAF8F5] transition-all hover:bg-[#3E362F] active:scale-95 shadow-sm ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs font-medium'
        }`}
        title="Install Indie Picks as an offline-capable web app"
      >
        <Download className="w-3.5 h-3.5 text-[#D99B3B]" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-[#D8CFBF] bg-[#FAF8F5] text-[#3E362F] hover:bg-[#F3EFE6] transition ${
            compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs font-medium'
          }`}
          title="Install on iPhone / iPad"
        >
          <Share2 className="w-3.5 h-3.5 text-[#D99B3B]" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2621]/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#FAF8F5] p-6 shadow-2xl border border-[#E4DCB] relative text-[#2C2621]">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-[#7A6F64] hover:text-[#2C2621] p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#EFE8D8] flex items-center justify-center text-[#B2741E]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#2C2621]">Install on iOS</h3>
              </div>

              <p className="text-xs text-[#6B5E51] mb-4 leading-relaxed">
                Add Indie Picks directly to your home screen for instant offline reading and book discovery.
              </p>

              <ol className="space-y-3 text-xs text-[#3E362F]">
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#E5DEC9] text-[#2C2621] font-semibold flex items-center justify-center text-[11px]">
                    1
                  </span>
                  <span>
                    Tap the <strong>Share</strong> button (box with upward arrow) in the Safari toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#E5DEC9] text-[#2C2621] font-semibold flex items-center justify-center text-[11px]">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#E5DEC9] text-[#2C2621] font-semibold flex items-center justify-center text-[11px]">
                    3
                  </span>
                  <span>
                    Tap <strong>Add</strong> in the top-right corner.
                  </span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-lg bg-[#2C2621] py-2 text-xs font-medium text-[#FAF8F5] hover:bg-[#3E362F] transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
