import React, { useState } from 'react';
import { User, ActiveMode, ADMIN_EMAIL } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import {
  BookOpen,
  Search,
  Feather,
  Compass,
  Bookmark,
  PlusCircle,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ShieldAlert,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  activeTab: 'explore' | 'books' | 'lists' | 'author-profile' | 'author-dashboard' | 'reader-dashboard' | 'authors' | 'admin-panel';
  selectedAuthorId: string | null;
  onNavigate: (tab: HeaderProps['activeTab'], authorId?: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenGoogleSignIn: () => void;
  onLogout: () => void;
  onOpenAuthorUpgrade: () => void;
  onSwitchMode: (mode: ActiveMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  selectedAuthorId,
  onNavigate,
  searchQuery,
  onSearchChange,
  onOpenGoogleSignIn,
  onLogout,
  onOpenAuthorUpgrade,
  onSwitchMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isMasonProfileActive = activeTab === 'author-profile' && selectedAuthorId === 'mason-carter';
  const isAdmin = currentUser?.isAdmin || (currentUser?.email && currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
  const isAuthor = currentUser?.isAuthor || isAdmin;

  const handleMasonCarterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate('author-profile', 'mason-carter');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8E1D3] bg-[#FAF8F5]/95 backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('explore')}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-[#2C2621] text-[#D99B3B] flex items-center justify-center shadow-xs transition group-hover:scale-105">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-bold text-xl tracking-wide text-[#2C2621] block leading-tight">
                  Indie Picks
                </span>
                <span className="text-[10px] tracking-wider uppercase text-[#8A7D6F] font-semibold block">
                  Independent Literature
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 pl-2">
              {/* Mason Carter simple navigation item */}
              <button
                onClick={handleMasonCarterClick}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  isMasonProfileActive
                    ? 'bg-[#EAE2D2] text-[#2C2621] font-semibold'
                    : 'text-[#6B5E51] hover:text-[#2C2621] hover:bg-[#F2ECE0]'
                }`}
                title="Mason Carter's author profile and books"
              >
                <Feather className="w-3.5 h-3.5 text-[#B2741E]" />
                <span>Mason Carter</span>
              </button>

              <button
                onClick={() => onNavigate('explore')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'explore'
                    ? 'bg-[#EAE2D2] text-[#2C2621] font-semibold'
                    : 'text-[#6B5E51] hover:text-[#2C2621] hover:bg-[#F2ECE0]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore</span>
              </button>

              <button
                onClick={() => onNavigate('books')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'books'
                    ? 'bg-[#EAE2D2] text-[#2C2621] font-semibold'
                    : 'text-[#6B5E51] hover:text-[#2C2621] hover:bg-[#F2ECE0]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Catalogue</span>
              </button>

              <button
                onClick={() => onNavigate('lists')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'lists'
                    ? 'bg-[#EAE2D2] text-[#2C2621] font-semibold'
                    : 'text-[#6B5E51] hover:text-[#2C2621] hover:bg-[#F2ECE0]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Curated Lists</span>
              </button>

              <button
                onClick={() => onNavigate('authors')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === 'authors'
                    ? 'bg-[#EAE2D2] text-[#2C2621] font-semibold'
                    : 'text-[#6B5E51] hover:text-[#2C2621] hover:bg-[#F2ECE0]'
                }`}
              >
                <Feather className="w-3.5 h-3.5" />
                <span>Authors</span>
              </button>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-2">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-[#8C7E70]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search books, authors, genres..."
                className="w-full rounded-lg border border-[#DDD5C5] bg-[#F5F1E8]/70 py-1.5 pl-9 pr-3 text-xs text-[#2C2621] placeholder-[#948779] transition focus:border-[#B2741E] focus:bg-[#FAF8F5] focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#8C7E70] hover:text-[#2C2621]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* PWA Install Button */}
            <div className="hidden sm:block">
              <PWAInstallButton />
            </div>

            {/* Authentication & User State */}
            {currentUser ? (
              <div className="relative">
                <div className="flex items-center gap-2">
                  {/* Mode-specific Quick Action Button */}
                  {isAdmin ? (
                    <button
                      onClick={() => onNavigate('admin-panel')}
                      className={`inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-800 hover:bg-red-100 transition shadow-xs ${
                        activeTab === 'admin-panel' ? 'ring-2 ring-red-600' : ''
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                      <span className="hidden sm:inline">Admin Panel</span>
                      <span className="sm:hidden">Admin</span>
                    </button>
                  ) : isAuthor ? (
                    <button
                      onClick={() => onNavigate('author-dashboard')}
                      className={`inline-flex items-center gap-1.5 rounded-lg border border-[#D5B876] bg-[#F8F2E2] px-2.5 py-1.5 text-xs font-semibold text-[#66430F] hover:bg-[#F2E8D0] transition shadow-xs ${
                        activeTab === 'author-dashboard' ? 'ring-2 ring-[#B2741E]' : ''
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-[#B2741E]" />
                      <span className="hidden sm:inline">Author Studio</span>
                      <span className="sm:hidden">Studio</span>
                    </button>
                  ) : (
                    <button
                      onClick={onOpenAuthorUpgrade}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#D5C9B3] bg-white px-2 py-1 text-[11px] font-medium text-[#5C4F42] hover:bg-[#FAF8F5]"
                    >
                      <Feather className="w-3 h-3 text-[#B2741E]" />
                      <span>Become an Author</span>
                    </button>
                  )}

                  {/* User Profile Avatar with dropdown */}
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[#EAE2D2] transition focus:outline-hidden"
                  >
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#C5BBA9]"
                    />
                    <ChevronDown className="w-3 h-3 text-[#7A6F64] hidden sm:block" />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#DDD5C5] bg-[#FAF8F5] p-2 text-xs shadow-xl z-50">
                    <div className="px-3 py-2 border-b border-[#EAE2D2] mb-1">
                      <span className="font-semibold text-[#2C2621] block truncate">
                        {currentUser.name}
                      </span>
                      <span className="text-[11px] text-[#7A6F64] block truncate">
                        {currentUser.email}
                      </span>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-xs ${
                            isAdmin
                              ? 'bg-red-100 text-red-800'
                              : isAuthor
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {isAdmin ? 'Admin' : isAuthor ? 'Author' : 'Reader'}
                        </span>
                        {currentUser.isMasonCarter && (
                          <span className="text-[10px] text-[#8C5D17] font-semibold">
                            (Mason Carter)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ROLE & MODE SWITCHING OPTIONS */}
                    <div className="py-1 border-b border-[#EAE2D2] space-y-1">
                      <span className="px-3 text-[10px] uppercase font-bold text-[#8C7E70] block">
                        Switch Workspace Mode
                      </span>

                      {/* Admin Mode (Exclusive for mushahidsyed1994@gmail.com) */}
                      {isAdmin && (
                        <button
                          onClick={() => {
                            onSwitchMode('admin');
                            onNavigate('admin-panel');
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-md flex items-center gap-2 ${
                            activeTab === 'admin-panel'
                              ? 'bg-red-100 font-bold text-red-900'
                              : 'hover:bg-[#F2ECE0] text-red-800'
                          }`}
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                          <span>Admin Moderation Panel</span>
                        </button>
                      )}

                      {/* Author Mode */}
                      {isAuthor ? (
                        <button
                          onClick={() => {
                            onSwitchMode('author');
                            onNavigate('author-dashboard');
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-md flex items-center gap-2 ${
                            activeTab === 'author-dashboard'
                              ? 'bg-[#EAE2D2] font-bold text-[#2C2621]'
                              : 'hover:bg-[#F2ECE0] text-[#2C2621]'
                          }`}
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-[#B2741E]" />
                          <span>Author Studio (Enlist Books)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onOpenAuthorUpgrade();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-md hover:bg-amber-50 text-[#8C5D17] flex items-center gap-2 font-medium"
                        >
                          <Feather className="w-3.5 h-3.5 text-[#B2741E]" />
                          <span>Opt-in as Author</span>
                        </button>
                      )}

                      {/* Reader Mode (Available to both Admin, Authors, and Readers) */}
                      <button
                        onClick={() => {
                          onSwitchMode('reader');
                          onNavigate('reader-dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-md flex items-center gap-2 ${
                          activeTab === 'reader-dashboard'
                            ? 'bg-[#EAE2D2] font-bold text-[#2C2621]'
                            : 'hover:bg-[#F2ECE0] text-[#2C2621]'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5 text-[#B2741E]" />
                        <span>Reader Mode (My Shelves)</span>
                      </button>
                    </div>

                    {isAuthor && (
                      <button
                        onClick={() => {
                          onNavigate('author-profile', currentUser.id);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#F2ECE0] text-[#2C2621] flex items-center gap-2 mt-1"
                      >
                        <Feather className="w-3.5 h-3.5 text-[#B2741E]" />
                        <span>View Public Author Page</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-md hover:bg-red-50 text-red-700 flex items-center gap-2 mt-1 border-t border-[#EAE2D2] pt-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Signed-out state: Clean Google Sign-in button */
              <button
                onClick={onOpenGoogleSignIn}
                className="inline-flex items-center gap-2 rounded-xl border border-[#D5C9B3] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#2C2621] hover:bg-[#F7F3EA] transition shadow-xs"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                <span>Sign in with Google</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#5C4F42] hover:text-[#2C2621] focus:outline-hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8E1D3] bg-[#FAF8F5] px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <div className="relative w-full mb-3">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#8C7E70]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search books, authors, genres..."
              className="w-full rounded-lg border border-[#DDD5C5] bg-[#F5F1E8] py-2 pl-9 pr-3 text-xs text-[#2C2621]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleMasonCarterClick}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-[#EFE8D8] text-[#2C2621] font-serif font-bold text-sm text-left col-span-2"
            >
              <Feather className="w-4 h-4 text-[#B2741E]" />
              <span>Mason Carter (Featured Author)</span>
            </button>

            <button
              onClick={() => {
                onNavigate('explore');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-[#E2D7C2] text-[#3E362F] text-xs font-medium text-left"
            >
              <Compass className="w-4 h-4 text-[#B2741E]" />
              <span>Explore</span>
            </button>

            <button
              onClick={() => {
                onNavigate('books');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-[#E2D7C2] text-[#3E362F] text-xs font-medium text-left"
            >
              <BookOpen className="w-4 h-4 text-[#B2741E]" />
              <span>Catalogue</span>
            </button>

            <button
              onClick={() => {
                onNavigate('lists');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-[#E2D7C2] text-[#3E362F] text-xs font-medium text-left"
            >
              <Bookmark className="w-4 h-4 text-[#B2741E]" />
              <span>Curated Lists</span>
            </button>

            <button
              onClick={() => {
                onNavigate('authors');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-[#E2D7C2] text-[#3E362F] text-xs font-medium text-left"
            >
              <Feather className="w-4 h-4 text-[#B2741E]" />
              <span>Authors</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  onNavigate('admin-panel');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-red-100 text-red-900 text-xs font-bold text-left col-span-2"
              >
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Admin Moderation Panel</span>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-[#E8E1D3] flex items-center justify-between">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div>
                  <span className="text-xs font-semibold block">{currentUser.name}</span>
                  <span className="text-[10px] text-[#7A6F64] capitalize">
                    {isAdmin ? 'Admin' : isAuthor ? 'Author' : 'Reader'}
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenGoogleSignIn();
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-semibold text-[#8C5D17] underline"
              >
                Sign in with Google
              </button>
            )}
            <PWAInstallButton compact />
          </div>
        </div>
      )}
    </header>
  );
};
