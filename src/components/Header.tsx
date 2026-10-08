import React, { useState } from 'react';
import { User } from '../types';
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
  UserCheck,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  activeTab: 'explore' | 'books' | 'lists' | 'author-profile' | 'author-dashboard' | 'reader-dashboard' | 'authors';
  selectedAuthorId: string | null;
  onNavigate: (tab: HeaderProps['activeTab'], authorId?: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenGoogleSignIn: () => void;
  onLogout: () => void;
  onOpenAuthSwitcher: () => void;
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
  onOpenAuthSwitcher,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isMasonProfileActive = activeTab === 'author-profile' && selectedAuthorId === 'mason-carter';

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
                  Free Author Discovery
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 pl-2">
              {/* Mason Carter prominently in top menu as requested */}
              <button
                onClick={handleMasonCarterClick}
                className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  isMasonProfileActive
                    ? 'bg-[#EAE2D2] text-[#2C2621] shadow-xs'
                    : 'text-[#5C4F42] hover:text-[#1F1A15] hover:bg-[#F2ECE0]'
                }`}
                title="View Mason Carter's author account, books, and reader Q&A"
              >
                <Feather className="w-3.5 h-3.5 text-[#B2741E]" />
                <span className="font-serif text-sm font-bold">Mason Carter</span>
                <span className="text-[10px] bg-[#D99B3B]/20 text-[#8C5D17] px-1.5 py-0.2 rounded-xs font-medium">
                  Author
                </span>
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
                <span>Explore Picks</span>
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
                <span>All Books</span>
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
                <span>Indie Authors</span>
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
                placeholder="Search titles, authors, genres..."
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
                  {currentUser.role === 'author' ? (
                    <button
                      onClick={() => onNavigate('author-dashboard')}
                      className={`hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#D5B876] bg-[#F8F2E2] px-3 py-1.5 text-xs font-semibold text-[#66430F] hover:bg-[#F2E8D0] transition shadow-xs ${
                        activeTab === 'author-dashboard' ? 'ring-2 ring-[#B2741E]' : ''
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-[#B2741E]" />
                      <span>Author Studio</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate('reader-dashboard')}
                      className={`hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#D8CFBF] bg-[#FAF8F5] px-3 py-1.5 text-xs font-medium text-[#2C2621] hover:bg-[#F0EBE0] transition shadow-xs ${
                        activeTab === 'reader-dashboard' ? 'ring-2 ring-[#8C7E70]' : ''
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5 text-[#B2741E]" />
                      <span>My Shelves</span>
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
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#DDD5C5] bg-[#FAF8F5] p-2 text-xs shadow-xl z-50">
                    <div className="px-3 py-2 border-b border-[#EAE2D2] mb-1">
                      <span className="font-semibold text-[#2C2621] block truncate">
                        {currentUser.name}
                      </span>
                      <span className="text-[11px] text-[#7A6F64] block truncate">
                        {currentUser.email}
                      </span>
                      <span className="mt-1 inline-block text-[10px] font-semibold text-[#8C5D17] bg-[#EFE8D8] px-1.5 py-0.2 rounded-xs">
                        {currentUser.role === 'author' ? 'Indie Author' : 'Reader'}
                      </span>
                    </div>

                    {currentUser.role === 'author' ? (
                      <button
                        onClick={() => {
                          onNavigate('author-dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#F2ECE0] text-[#2C2621] flex items-center gap-2"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-[#B2741E]" />
                        <span>Author Studio & Books</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onNavigate('reader-dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#F2ECE0] text-[#2C2621] flex items-center gap-2"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-[#B2741E]" />
                        <span>My Reading Shelves</span>
                      </button>
                    )}

                    {currentUser.role === 'author' && (
                      <button
                        onClick={() => {
                          onNavigate('author-profile', currentUser.id);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#F2ECE0] text-[#2C2621] flex items-center gap-2"
                      >
                        <Feather className="w-3.5 h-3.5 text-[#B2741E]" />
                        <span>View Public Author Page</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onOpenAuthSwitcher();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#F2ECE0] text-[#5C4F42] flex items-center gap-2"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#8C7E70]" />
                      <span>Switch / Test Personas</span>
                    </button>

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
                {/* Google "G" Icon */}
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
              className="flex items-center gap-2 p-2.5 rounded-lg bg-[#EFE8D8] text-[#2C2621] font-serif font-bold text-sm text-left"
            >
              <Feather className="w-4 h-4 text-[#B2741E]" />
              <span>Mason Carter</span>
            </button>

            <button
              onClick={() => {
                onNavigate('explore');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-[#E2D7C2] text-[#3E362F] text-xs font-medium text-left"
            >
              <Compass className="w-4 h-4 text-[#B2741E]" />
              <span>Explore Picks</span>
            </button>

            <button
              onClick={() => {
                onNavigate('books');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-[#E2D7C2] text-[#3E362F] text-xs font-medium text-left"
            >
              <BookOpen className="w-4 h-4 text-[#B2741E]" />
              <span>All Books</span>
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
              className="flex items-center gap-2 p-2.5 rounded-lg border border-[#E2D7C2] text-[#3E362F] text-xs font-medium text-left col-span-2"
            >
              <Feather className="w-4 h-4 text-[#B2741E]" />
              <span>Browse Indie Authors</span>
            </button>
          </div>

          <div className="pt-3 border-t border-[#E8E1D3] flex items-center justify-between">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <span className="text-xs font-semibold">{currentUser.name}</span>
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
