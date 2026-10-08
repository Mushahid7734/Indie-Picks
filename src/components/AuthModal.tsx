import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { countWords } from '../lib/storage';
import { signInWithGoogle } from '../lib/firebase';
import {
  X,
  Feather,
  Bookmark,
  Check,
  AlertCircle,
  Sparkles,
  User as UserIcon,
  ArrowRight,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  allUsers: User[];
  onSelectUser: (userId: string | null) => void;
  onRegisterUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  onGoogleLoginSuccess: (googleUser: {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string | null;
  }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSelectUser,
  onRegisterUser,
  onGoogleLoginSuccess,
}) => {
  const [step, setStep] = useState<'sign-in' | 'onboarding'>('sign-in');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Pending Google Account awaiting profile completion
  const [pendingGoogle, setPendingGoogle] = useState<{
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string | null;
  } | null>(null);

  // Profile Onboarding Form
  const [role, setRole] = useState<UserRole>('author');
  const [name, setName] = useState('');
  const [penName, setPenName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  if (!isOpen) return null;

  const currentBioWords = countWords(bio);

  const handleGoogleSignInClick = async () => {
    setGoogleLoading(true);
    setAuthError(null);

    try {
      // 1. Try real Firebase Google Sign-In Popup
      const result = await signInWithGoogle();
      if (result) {
        processGoogleResult(result);
      }
    } catch (err: unknown) {
      console.warn('Real Firebase Google Sign-In not ready or popup closed:', err);
      // If Firebase Auth isn't provisioned yet or error occurred, provide immediate demo Google login
      const demoEmail = prompt('Enter your Google email to test sign in:', 'author@example.com');
      if (demoEmail && demoEmail.trim()) {
        const demoName = demoEmail.split('@')[0].replace(/[._]/g, ' ');
        const capName = demoName.charAt(0).toUpperCase() + demoName.slice(1);
        processGoogleResult({
          uid: `google-${Date.now()}`,
          email: demoEmail.trim(),
          displayName: capName,
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        });
      } else {
        setAuthError('Sign in was cancelled.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const processGoogleResult = (googleUser: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }) => {
    const email = googleUser.email || '';
    const displayName = googleUser.displayName || 'Anonymous Reader';

    // Check if user already exists
    const existing = allUsers.find(
      (u) =>
        (u.googleUid && u.googleUid === googleUser.uid) ||
        (u.email && u.email.toLowerCase() === email.toLowerCase())
    );

    if (existing) {
      // Existing user: sign them in immediately
      onSelectUser(existing.id);
      onClose();
    } else {
      // New user: move to Step 2: Choose Role (Author or Reader) and set Bio
      setPendingGoogle({
        uid: googleUser.uid,
        email,
        displayName,
        photoURL: googleUser.photoURL,
      });
      setName(displayName);
      setAvatarUrl(
        googleUser.photoURL ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      );
      setStep('onboarding');
    }
  };

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const words = countWords(bio);
    if (words > 150) {
      setAuthError(`Bio cannot exceed 150 words (currently ${words} words).`);
      return;
    }

    try {
      onRegisterUser({
        name: name.trim() || pendingGoogle?.displayName || 'Indie User',
        email: pendingGoogle?.email || `${Date.now()}@example.com`,
        role,
        avatarUrl: avatarUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: bio.trim(),
        penName: penName.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        googleUid: pendingGoogle?.uid,
      });
      onClose();
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Registration error');
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

        {/* STEP 1: SIGN IN WITH GOOGLE */}
        {step === 'sign-in' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#2C2621] text-[#D99B3B] flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#2C2621]">
                Join Indie Picks
              </h2>
              <p className="text-xs text-[#7A6F64] mt-1 max-w-xs mx-auto">
                Sign in with your Google account to create your author studio or reader shelves.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Google Sign-In Button */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleSignInClick}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-[#D5C9B3] bg-white py-3 px-4 text-xs font-semibold text-[#2C2621] hover:bg-[#F7F3EA] transition shadow-xs active:scale-98"
              >
                {/* Google "G" logo */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {googleLoading ? 'Connecting with Google...' : 'Continue with Google'}
                </span>
              </button>

              {/* Direct Quick Login for Admin / Mason Carter */}
              <button
                onClick={() => {
                  onSelectUser('mason-carter');
                  onClose();
                }}
                className="w-full flex items-center justify-between rounded-xl border border-[#D5B876] bg-[#F9F4E8] py-2.5 px-3.5 text-xs text-[#5C3F0F] hover:bg-[#F2E8D2] transition"
              >
                <div className="flex items-center gap-2">
                  <Feather className="w-3.5 h-3.5 text-[#B2741E]" />
                  <span className="font-semibold">Sign In as Mason Carter (Admin)</span>
                </div>
                <span className="text-[10px] font-mono text-[#8C5D17]">mushahidsyed1994@gmail.com</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROFILE ONBOARDING (After Google Sign-In) */}
        {step === 'onboarding' && (
          <form onSubmit={handleCompleteOnboarding} className="space-y-4 text-xs">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B2741E] block">
                Step 2 of 2 · Profile Setup
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#2C2621]">
                Complete Your Indie Profile
              </h2>
              <p className="text-xs text-[#7A6F64] mt-0.5">
                Signed in as <strong>{pendingGoogle?.email}</strong>. Choose whether you publish or read.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Role Switcher */}
            <div>
              <label className="block font-semibold text-[#3E362F] mb-1.5">
                What brings you to Indie Picks? *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('author')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                    role === 'author'
                      ? 'border-[#B2741E] bg-[#F7F3EA] font-bold text-[#2C2621] ring-1 ring-[#B2741E]'
                      : 'border-[#DDD5C5] text-[#5C4F42] hover:bg-white'
                  }`}
                >
                  <Feather className="w-4 h-4 text-[#B2741E] flex-shrink-0" />
                  <div>
                    <span className="block font-semibold">Indie Author</span>
                    <span className="text-[10px] text-[#7A6F64] font-normal">Publish & sell</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('reader')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                    role === 'reader'
                      ? 'border-[#B2741E] bg-[#F7F3EA] font-bold text-[#2C2621] ring-1 ring-[#B2741E]'
                      : 'border-[#DDD5C5] text-[#5C4F42] hover:bg-white'
                  }`}
                >
                  <Bookmark className="w-4 h-4 text-[#B2741E] flex-shrink-0" />
                  <div>
                    <span className="block font-semibold">Avid Reader</span>
                    <span className="text-[10px] text-[#7A6F64] font-normal">Shelves & lists</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#3E362F] mb-1">
                  Your Display Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[#DDD5C5] bg-white p-2.5 text-xs text-[#2C2621]"
                  required
                />
              </div>

              {role === 'author' ? (
                <div>
                  <label className="block font-semibold text-[#3E362F] mb-1">
                    Pen Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={penName}
                    onChange={(e) => setPenName(e.target.value)}
                    placeholder="e.g. M. K. Thorne"
                    className="w-full rounded-lg border border-[#DDD5C5] bg-white p-2.5 text-xs text-[#2C2621]"
                  />
                </div>
              ) : null}
            </div>

            <div>
              <label className="block font-semibold text-[#3E362F] mb-1">
                Profile Photo (Image URL)
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-[#DDD5C5] bg-white p-2.5 text-xs text-[#2C2621]"
              />
              <span className="text-[10px] text-[#8C7E70] mt-0.5 block">
                Pre-filled from your Google photo or paste an external image link.
              </span>
            </div>

            {/* Bio with Live Word Counter (Max 150 Words) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-[#3E362F]">
                  {role === 'author' ? 'Author Bio (Max 150 words) *' : 'Reader Bio (Max 150 words) *'}
                </label>
                <span
                  className={`text-[11px] font-semibold ${
                    currentBioWords > 150 ? 'text-red-600' : 'text-[#8C7E70]'
                  }`}
                >
                  {currentBioWords} / 150 words
                </span>
              </div>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={
                  role === 'author'
                    ? 'Write your author background, literary genres, and publishing journey...'
                    : 'Share your favorite books, reading goals, and preferred indie genres...'
                }
                className={`w-full rounded-lg border p-2.5 text-xs text-[#2C2621] ${
                  currentBioWords > 150 ? 'border-red-400 bg-red-50/20' : 'border-[#DDD5C5] bg-white'
                }`}
                required
              />
              {currentBioWords > 150 && (
                <p className="mt-1 text-[11px] text-red-600">
                  Please trim {currentBioWords - 150} words to stay under the 150-word limit.
                </p>
              )}
            </div>

            {role === 'author' && (
              <div>
                <label className="block font-semibold text-[#3E362F] mb-1">
                  Author Website / Shop Link
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full rounded-lg border border-[#DDD5C5] bg-white p-2.5 text-xs text-[#2C2621]"
                />
              </div>
            )}

            <div className="pt-3 border-t border-[#DDD5C5] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep('sign-in')}
                className="px-4 py-2 text-xs text-[#7A6F64]"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={currentBioWords > 150}
                className="rounded-lg bg-[#2C2621] px-5 py-2.5 text-xs font-semibold text-[#FAF8F5] hover:bg-[#3E362F] transition disabled:opacity-50"
              >
                Start Using Indie Picks
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
