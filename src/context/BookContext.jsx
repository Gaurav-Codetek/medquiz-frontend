import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const BookContext = createContext(null);

export const BookProvider = ({ children }) => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [activeBook, setActiveBook] = useState('guyton');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [user]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const res = await api.document.getBooks();
      setBooks(res.books);
      
      // If activeBook is not in the list, set to the first one available
      if (res.books.length > 0 && !res.books.find(b => b.id === activeBook)) {
        setActiveBook(res.books[0].id);
      }
    } catch (err) {
      console.error("Failed to load books:", err);
    } finally {
      setLoading(false);
    }
  };

  const switchBook = (bookId) => {
    setActiveBook(bookId);
    // You could also link this to ChatContext to clear chat/start new session,
    // but typically keeping it continuous is fine, just new queries target new book.
  };

  return (
    <BookContext.Provider value={{ books, activeBook, switchBook, loading, loadBooks }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBook = () => useContext(BookContext);
