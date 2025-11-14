import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

function Navbar() {
  const location = useLocation();
  const { favorites, user, logout } = useApp();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingCart size={28} />
            <span className="text-xl font-bold">Compify</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${isActive('/')}`}
            >
              Inicio
            </Link>
            <Link
              to="/builder"
              className={`px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${isActive('/builder')}`}
            >
              Arma tu PC
            </Link>
            <Link
              to="/favorites"
              className={`px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 ${isActive('/favorites')}`}
            >
              <Heart size={18} fill={favorites.length > 0 ? 'currentColor' : 'none'} />
              <span>Favoritos</span>
              {favorites.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* User Section */}
            {user ? (
              <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-blue-500">
                <User size={18} />
                <span className="text-sm">{user.username}</span>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`ml-4 pl-4 border-l border-blue-500 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 ${isActive('/login')}`}
              >
                <User size={18} />
                <span>Ingresar</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
