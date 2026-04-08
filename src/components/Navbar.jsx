import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBook } from '../context/BookContext';
import { useChat } from '../context/ChatContext';
import { FiGrid, FiBookOpen, FiHelpCircle, FiLogOut, FiBook } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { books, activeBook, switchBook, loading } = useBook();
  const { toggleDrawer } = useChat();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="brand-icon">🧬</span>
          <span>Med<span className="brand-accent">Quiz</span> AI</span>
        </NavLink>

        <ul className="navbar-links">
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
              <FiGrid size={16} /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/browse" className={({ isActive }) => isActive ? 'active' : ''}>
              <FiBookOpen size={16} /> Browse
            </NavLink>
          </li>
          <li>
            <NavLink to="/quiz" className={({ isActive }) => isActive ? 'active' : ''}>
              <HiOutlineAcademicCap size={16} /> Quiz
            </NavLink>
          </li>
          <li>
            <NavLink to="/ask" className={({ isActive }) => isActive ? 'active' : ''}>
              <FiHelpCircle size={16} /> Ask AI
            </NavLink>
          </li>
        </ul>

        <div className="navbar-user">
          {books && books.length > 0 && (
            <div className="flex items-center gap-2 mr-4 bg-dark-bg border border-white/10 rounded-lg px-2 py-1">
              <FiBook size={14} className="text-primary-light" />
              <select 
                value={activeBook} 
                onChange={(e) => switchBook(e.target.value)}
                disabled={loading}
                className="bg-transparent text-white text-sm outline-none border-none cursor-pointer"
                style={{ width: '150px' }}
              >
                {books.map(b => (
                  <option key={b.id} value={b.id} className="bg-dark-bg text-white">
                    {b.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button className="btn btn-primary btn-sm" onClick={toggleDrawer} style={{marginRight: '12px', display: 'flex', alignItems: 'center', gap: '4px'}}>
             <span>✨</span> Drawer
          </button>
          <span className="user-name">{user.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
