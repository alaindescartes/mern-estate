import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

function Header() {
  const currentUser = useSelector(state => state.user.currentUser);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); // Import and use `useLocation`

  function handleSubmit(event) {
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search); // Use `location.search`
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]); // Listen for changes to `location.search`

  return (
    <header className="bg-gradient-to-r from-blue-500 to-blue-700 shadow-lg sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-4">
        {/* Logo */}
        <Link to="/">
          <h1 className="font-extrabold text-xl sm:text-3xl flex items-baseline space-x-2 text-white">
            <span>Demo</span>
            <span className="text-yellow-300">Estate</span>
          </h1>
        </Link>

        {/* Search Form */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center bg-white rounded-lg shadow-md px-4 py-2"
        >
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent focus:outline-none w-28 sm:w-64 text-sm text-gray-800"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button className="ml-2">
            <FaSearch className="text-blue-500 hover:text-blue-700 transition" />
          </button>
        </form>

        {/* Navigation */}
        <ul className="flex items-center gap-6">
          <Link to="/">
            <li className="hidden sm:inline text-white font-medium hover:text-yellow-300 transition">
              Home
            </li>
          </Link>
          <Link to="/about">
            <li className="hidden sm:inline text-white font-medium hover:text-yellow-300 transition">
              About
            </li>
          </Link>
          <Link to="/profile">
            {currentUser ? (
              <img
                className="rounded-full h-8 w-8 object-cover border-2 border-yellow-300 shadow-md"
                src={currentUser?.avatar}
                alt="User profile"
              />
            ) : (
              <li className="text-white font-medium hover:text-yellow-300 transition">Sign in</li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}

export default Header;
