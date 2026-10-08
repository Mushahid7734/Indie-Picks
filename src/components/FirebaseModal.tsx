import React, { useState } from 'react';
import { getSavedFirebaseConfig, saveFirebaseConfig, initFirebaseService } from '../lib/firebase';
import { storage } from '../lib/storage';
import { FirebaseConnectionConfig } from '../types';
import {
  X,
  Database,
  Check,
  AlertCircle,
  ExternalLink,
  Github,
  Sparkles,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirebaseConnected: boolean;
  onSyncReload: () => void;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = ({
  isOpen,
  onClose,
  isFirebaseConnected,
  onSyncReload,
}) => {
  const currentConfig = getSavedFirebaseConfig();
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [databaseURL, setDatabaseURL] = useState(currentConfig.databaseURL || '');
  const [projectId, setProjectId] = useState(currentConfig.projectId || '');
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain || '');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveAndTest = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setStatusType(null);

    const config: FirebaseConnectionConfig = {
      apiKey: apiKey.trim(),
      databaseURL: databaseURL.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim(),
      enabled: Boolean(apiKey.trim() && databaseURL.trim()),
    };

    saveFirebaseConfig(config);

    if (config.enabled) {
      const test = initFirebaseService(config);
      if (test.success) {
        storage.connectFirebase();
        setStatusType('success');
        setStatusMessage('✓ Connected to Firebase Realtime Database! Realtime live synchronization is now active.');
        onSyncReload();
      } else {
        setStatusType('error');
        setStatusMessage(`Connection attempt failed: ${test.error || 'Please check API Key and Database URL'}`);
      }
    } else {
      setStatusType('success');
      setStatusMessage('Saved in Local-First Mode (using BroadcastChannel cross-tab realtime sync).');
      onSyncReload();
    }
  };

  const handleResetSeed = () => {
    if (confirm('Reset catalogue to original Indie Picks seed data (Mason Carter books, reviews, shelves)?')) {
      storage.resetToInitialSeed();
      setResetSuccess(true);
      onSyncReload();
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2621]/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        className="relative my-8 w-full max-w-xl rounded-2xl bg-[#FAF8F5] p-6 sm:p-8 shadow-2xl border border-[#DDD5C5] text-[#2C2621]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-[#EFE8D8] p-1.5 text-[#5C4F42] hover:bg-[#E2D7C2]"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#2C2621] text-[#D99B3B] flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#2C2621]">
              Firebase Realtime & GitHub Setup
            </h2>
            <span className="text-xs text-[#7A6F64]">
              {isFirebaseConnected
                ? 'Status: Connected to Live Firebase Database'
                : 'Status: Local-First (Ready for your free Firebase credentials)'}
            </span>
          </div>
        </div>

        {/* Free Forever Banner */}
        <div className="mt-4 rounded-xl border border-[#D5B876] bg-[#FAF5E8] p-3.5 text-xs text-[#6B4B18] space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-[#8C5D17]">
            <ShieldCheck className="w-4 h-4 text-[#B2741E]" />
            <span>Built for the 100% Free Tier (No Pricing, No Surprises)</span>
          </div>
          <p className="leading-relaxed">
            By strictly prohibiting direct binary image uploads and utilizing direct external URLs (Unsplash, Imgur, or personal CDNs), Indie Picks stores only clean JSON text. This stays safely within Firebase’s permanent 1GB free tier forever.
          </p>
        </div>

        {/* GitHub Hosting Guide note */}
        <div className="mt-3 rounded-xl border border-[#E5DEC9] bg-[#F7F3EA] p-3 text-xs text-[#5C4F42] flex items-start gap-2.5">
          <Github className="w-4 h-4 text-[#2C2621] mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold text-[#2C2621]">Host Free on GitHub Pages:</span>
            <p className="mt-0.5 text-[#6B5E51]">
              Run <code className="bg-[#EAE2D2] px-1 py-0.5 rounded text-[11px]">npm run build</code>, push the <code className="bg-[#EAE2D2] px-1 py-0.5 rounded text-[11px]">dist</code> folder to GitHub Pages, and Indie Picks runs as a static Progressive Web App with zero backend server costs!
            </p>
          </div>
        </div>

        {/* Config Form */}
        <div className="mt-4 rounded-xl border border-[#D5C9B3] bg-stone-100 p-3 text-xs text-[#3E362F] space-y-1">
          <div className="font-semibold text-[#2C2621]">
            🔒 Production Best Practice (Invisible to Visitors):
          </div>
          <p className="text-[11px] leading-relaxed text-[#5C4F42]">
            Put your keys into <code className="bg-white px-1.5 py-0.5 rounded border border-[#DDD5C5]">.env</code> before running <code className="bg-white px-1.5 py-0.5 rounded border border-[#DDD5C5]">npm run build</code>. The app will automatically connect behind the scenes with <strong>zero setup buttons</strong> visible to any visitors!
          </p>
        </div>

        <form onSubmit={handleSaveAndTest} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#3E362F] mb-1">
              Firebase Realtime Database URL
            </label>
            <input
              type="text"
              value={databaseURL}
              onChange={(e) => setDatabaseURL(e.target.value)}
              placeholder="https://your-project-id-default-rtdb.firebaseio.com"
              className="w-full rounded-lg border border-[#DDD5C5] bg-white p-2.5 text-xs text-[#2C2621]"
            />
            <span className="text-[10px] text-[#8C7E70] block mt-0.5">
              Found under Firebase Console &gt; Realtime Database &gt; URL at the top of your database.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#3E362F] mb-1">
                API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-lg border border-[#DDD5C5] bg-white p-2.5 text-xs text-[#2C2621]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#3E362F] mb-1">
                Project ID
              </label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="indie-picks-app"
                className="w-full rounded-lg border border-[#DDD5C5] bg-white p-2.5 text-xs text-[#2C2621]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#3E362F] mb-1">
              Auth Domain (Optional)
            </label>
            <input
              type="text"
              value={authDomain}
              onChange={(e) => setAuthDomain(e.target.value)}
              placeholder="indie-picks-app.firebaseapp.com"
              className="w-full rounded-lg border border-[#DDD5C5] bg-white p-2.5 text-xs text-[#2C2621]"
            />
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-medium flex items-start gap-2 ${
                statusType === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {statusType === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="pt-3 border-t border-[#DDD5C5] flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetSeed}
              className="inline-flex items-center gap-1.5 text-xs text-[#7A6F64] hover:text-[#2C2621]"
              title="Reset sample data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Seed Books</span>
            </button>

            <button
              type="submit"
              className="rounded-lg bg-[#2C2621] px-5 py-2.5 text-xs font-semibold text-[#FAF8F5] hover:bg-[#3E362F] transition shadow-xs"
            >
              Save & Test Connection
            </button>
          </div>

          {resetSuccess && (
            <p className="text-[11px] text-emerald-700 text-center font-medium">
              ✓ Reset completed to default Indie Picks library!
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
