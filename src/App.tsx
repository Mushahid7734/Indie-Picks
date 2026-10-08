import React, { useState, useEffect } from 'react';
import { storage } from './lib/storage';
import { User, Book, Review, ShelfItem, ShelfStatus, Question, CuratedList, ActiveMode, UserRole } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ExploreTab } from './components/ExploreTab';
import { AllBooksView } from './components/AllBooksView';
import { AuthorsListView } from './components/AuthorsListView';
import { AuthorProfileView } from './components/AuthorProfileView';
import { AuthorDashboard } from './components/AuthorDashboard';
import { ReaderDashboard } from './components/ReaderDashboard';
import { CuratedListsView } from './components/CuratedListsView';
import { AdminPanel } from './components/AdminPanel';
import { BecomeAuthorModal } from './components/BecomeAuthorModal';
import { BookDetailModal } from './components/BookDetailModal';
import { FirebaseModal } from './components/FirebaseModal';
import { AuthModal } from './components/AuthModal';
import { OfflineIndicator } from './components/OfflineIndicator';

type AppTab =
  | 'explore'
  | 'books'
  | 'lists'
  | 'author-profile'
  | 'author-dashboard'
  | 'reader-dashboard'
  | 'authors'
  | 'admin-panel';

export default function App() {
  // Application Data States
  const [currentUser, setCurrentUser] = useState<User | null>(storage.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(storage.getUsers());
  const [books, setBooks] = useState<Book[]>(storage.getBooks());
  const [reviews, setReviews] = useState<Review[]>(storage.getReviews());
  const [shelves, setShelves] = useState<ShelfItem[]>(storage.getShelves());
  const [questions, setQuestions] = useState<Question[]>(storage.getQuestions());
  const [curatedLists, setCuratedLists] = useState<CuratedList[]>(storage.getLists());
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(storage.getFirebaseStatus());

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<AppTab>('explore');
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isBecomeAuthorModalOpen, setIsBecomeAuthorModalOpen] = useState<boolean>(false);

  // Sync state from storage
  const syncStateFromStorage = () => {
    setCurrentUser(storage.getCurrentUser());
    setAllUsers(storage.getUsers());
    setBooks(storage.getBooks());
    setReviews(storage.getReviews());
    setShelves(storage.getShelves());
    setQuestions(storage.getQuestions());
    setCuratedLists(storage.getLists());
    setIsFirebaseConnected(storage.getFirebaseStatus());
  };

  useEffect(() => {
    const unsubscribe = storage.subscribe(syncStateFromStorage);
    return () => unsubscribe();
  }, []);

  // Handlers
  const handleNavigate = (tab: AppTab, authorId?: string | null) => {
    if ((tab === 'author-dashboard' || tab === 'reader-dashboard') && !currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setActiveTab(tab);
    if (authorId !== undefined) {
      setSelectedAuthorId(authorId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAuthor = (authorId: string) => {
    setSelectedAuthorId(authorId);
    setActiveTab('author-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    storage.incrementBookViews(book.id);
  };

  const handleShelfChange = (bookId: string, status: ShelfStatus | 'remove') => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    storage.setShelfStatus(bookId, status);
  };

  const handleAddReview = (bookId: string, rating: number, comment: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    storage.addReview(bookId, rating, comment);
  };

  const handleAskQuestion = (authorId: string, questionText: string, bookId?: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    storage.askQuestion(authorId, questionText, bookId);
  };

  const handleAnswerQuestion = (questionId: string, answerText: string) => {
    storage.answerQuestion(questionId, answerText);
  };

  const handleAddBook = (bookData: any) => {
    storage.addBook(bookData);
  };

  const handleUpdateBook = (bookId: string, updates: Partial<Book>) => {
    storage.updateBook(bookId, updates);
  };

  const handleDeleteBook = (bookId: string) => {
    storage.deleteBook(bookId);
    if (selectedBook?.id === bookId) {
      setSelectedBook(null);
    }
  };

  const handleCreateCuratedList = (title: string, description: string, bookIds: string[]) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    storage.createCuratedList(title, description, bookIds);
  };

  const handleToggleLikeList = (listId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    storage.toggleLikeList(listId);
  };

  const handleUpdateProfile = (userId: string, data: Partial<User>) => {
    storage.updateUserProfile(userId, data);
  };

  const handleSelectUser = (userId: string | null) => {
    storage.setCurrentUser(userId);
  };

  const handleRegisterUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    storage.registerUser(userData);
  };

  const handleGoogleLoginSuccess = (googleUser: {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string | null;
  }) => {
    storage.loginWithGoogleData(googleUser);
  };

  // Resolve author for author profile view
  const currentViewingAuthor = selectedAuthorId
    ? allUsers.find((u) => u.id === selectedAuthorId) ||
      allUsers.find((u) => u.isMasonCarter) ||
      currentUser ||
      allUsers[0]
    : allUsers.find((u) => u.isMasonCarter) || currentUser || allUsers[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2C2621]">
      {/* Navigation Header */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        selectedAuthorId={selectedAuthorId}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim() && activeTab !== 'books') {
            setActiveTab('books');
          }
        }}
        onOpenGoogleSignIn={() => setIsAuthModalOpen(true)}
        onLogout={() => storage.logout()}
        onOpenAuthorUpgrade={() => setIsBecomeAuthorModalOpen(true)}
        onSwitchMode={(mode: ActiveMode) => storage.switchActiveMode(mode)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {activeTab === 'explore' && (
          <ExploreTab
            books={books}
            reviews={reviews}
            shelves={shelves}
            curatedLists={curatedLists}
            currentUser={currentUser || allUsers[0]}
            featuredAuthor={allUsers.find((u) => u.isMasonCarter) || allUsers[0]}
            onSelectBook={handleSelectBook}
            onSelectAuthor={handleSelectAuthor}
            onShelfChange={handleShelfChange}
            onToggleLikeList={handleToggleLikeList}
            onOpenAuthorDashboard={() => {
              if (!currentUser) setIsAuthModalOpen(true);
              else handleNavigate('author-dashboard');
            }}
          />
        )}

        {activeTab === 'books' && (
          <AllBooksView
            books={books}
            reviews={reviews}
            shelves={shelves}
            currentUserId={currentUser ? currentUser.id : ''}
            searchQuery={searchQuery}
            onSelectBook={handleSelectBook}
            onSelectAuthor={handleSelectAuthor}
            onShelfChange={handleShelfChange}
          />
        )}

        {activeTab === 'authors' && (
          <AuthorsListView
            authors={allUsers.filter((u) => u.role === 'author')}
            books={books}
            questions={questions}
            onSelectAuthor={handleSelectAuthor}
          />
        )}

        {activeTab === 'author-profile' && currentViewingAuthor && (
          <AuthorProfileView
            author={currentViewingAuthor}
            books={books}
            reviews={reviews}
            shelves={shelves}
            questions={questions}
            currentUser={currentUser || allUsers[0]}
            onSelectBook={handleSelectBook}
            onShelfChange={handleShelfChange}
            onAskQuestion={handleAskQuestion}
            onOpenDashboard={() => {
              if (!currentUser) setIsAuthModalOpen(true);
              else setActiveTab('author-dashboard');
            }}
          />
        )}

        {activeTab === 'author-dashboard' && currentUser && (currentUser.isAuthor || currentUser.isAdmin) && (
          <AuthorDashboard
            currentUser={currentUser}
            books={books}
            reviews={reviews}
            shelves={shelves}
            questions={questions}
            onAddBook={handleAddBook}
            onUpdateBook={handleUpdateBook}
            onDeleteBook={handleDeleteBook}
            onAnswerQuestion={handleAnswerQuestion}
            onUpdateProfile={handleUpdateProfile}
            onViewBook={handleSelectBook}
          />
        )}

        {activeTab === 'reader-dashboard' && currentUser && (
          <ReaderDashboard
            currentUser={currentUser}
            books={books}
            shelves={shelves}
            reviews={reviews}
            curatedLists={curatedLists}
            onSelectBook={handleSelectBook}
            onSelectAuthor={handleSelectAuthor}
            onShelfChange={handleShelfChange}
            onCreateCuratedList={handleCreateCuratedList}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {activeTab === 'lists' && (
          <CuratedListsView
            lists={curatedLists}
            books={books}
            currentUser={currentUser || allUsers[0]}
            onSelectBook={handleSelectBook}
            onToggleLikeList={handleToggleLikeList}
            onOpenCreateList={() => {
              if (!currentUser) {
                setIsAuthModalOpen(true);
              } else {
                setActiveTab('reader-dashboard');
              }
            }}
          />
        )}

        {activeTab === 'admin-panel' && currentUser && currentUser.isAdmin && (
          <AdminPanel
            currentUser={currentUser}
            books={books}
            users={allUsers}
            reviews={reviews}
            questions={questions}
            lists={curatedLists}
            onDeleteBook={(bookId) => storage.adminDeleteBook(bookId)}
            onDeleteUser={(userId) => storage.adminDeleteUser(userId)}
            onUpdateUserRole={(userId, newRole) => storage.adminUpdateUserRole(userId, newRole)}
            onDeleteReview={(reviewId) => storage.adminDeleteReview(reviewId)}
            onDeleteQuestion={(questionId) => storage.adminDeleteQuestion(questionId)}
            onDeleteList={(listId) => storage.adminDeleteCuratedList(listId)}
            onCleanReset={() => storage.resetToCleanState()}
            onViewBook={handleSelectBook}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigateMasonCarter={() => handleNavigate('author-profile', 'mason-carter')}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onNavigateExplore={() => handleNavigate('explore')}
        onNavigateCatalogue={() => handleNavigate('books')}
        onNavigateLists={() => handleNavigate('lists')}
        onNavigateAuthors={() => handleNavigate('authors')}
      />

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          reviews={reviews}
          shelves={shelves}
          questions={questions}
          currentUser={currentUser || allUsers[0]}
          onClose={() => setSelectedBook(null)}
          onSelectAuthor={(authorId) => {
            setSelectedBook(null);
            handleSelectAuthor(authorId);
          }}
          onShelfChange={handleShelfChange}
          onAddReview={handleAddReview}
          onAskQuestion={handleAskQuestion}
        />
      )}

      {/* Firebase Realtime Connection Modal */}
      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        isFirebaseConnected={isFirebaseConnected}
        onSyncReload={syncStateFromStorage}
      />

      {/* User Google Sign-In & Onboarding Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={handleSelectUser}
        onRegisterUser={handleRegisterUser}
        onGoogleLoginSuccess={handleGoogleLoginSuccess}
      />

      {/* Reader to Author Upgrade Modal */}
      <BecomeAuthorModal
        isOpen={isBecomeAuthorModalOpen}
        onClose={() => setIsBecomeAuthorModalOpen(false)}
        onUpgrade={(penName, bio, websiteUrl) => {
          storage.upgradeReaderToAuthor(penName, bio, websiteUrl);
          handleNavigate('author-dashboard');
        }}
        currentName={currentUser?.name || ''}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
