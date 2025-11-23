import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Navbar() {
  const location = useLocation();
  const { favorites, user, logout } = useApp();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  // Función para manejar navegación protegida
  const handleProtectedNav = (e, path) => {
    if (!user) {
      e.preventDefault();
      setShowLoginModal(true);
      return;
    }
    navigate(path);
  };

  // Ocultar navegación principal en login y register
  const hideMainNav = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Solo nombre como logo */}
          <Link to="/" className="text-2xl font-bold">Compify</Link>

          {/* Navigation Links y Usuario/Login/Registro */}
          {!hideMainNav && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Link
                  to="/"
                  className={`px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-base font-semibold ${isActive('/')}`}
                >
                  Inicio
                </Link>
                <Link
                  to={user ? "/builder" : location.pathname}
                  className={`px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-base font-semibold ${isActive('/builder')}`}
                  onClick={e => handleProtectedNav(e, '/builder')}
                >
                  Arma tu PC
                </Link>
                <Link
                  to={user ? "/favorites" : location.pathname}
                  className={`px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-base font-semibold ${isActive('/favorites')}`}
                  onClick={e => handleProtectedNav(e, '/favorites')}
                >
                  <Heart size={22} fill={favorites.length > 0 ? 'currentColor' : 'none'} />
                  <span>Favoritos</span>
                  {favorites.length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {favorites.length}
                    </span>
                  )}
                </Link>
              </div>
              {/* Usuario o botones de login/registro */}
              <div className="flex items-center gap-3">
                {user ? (
                  <div className="relative">
                    <button
                      className="font-semibold text-blue-800 text-base bg-blue-50 px-4 py-2 rounded-lg focus:outline-none"
                      onClick={() => setShowMenu((prev) => !prev)}
                    >
                      {user.username}
                    </button>
                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            logout();
                            navigate('/login');
                          }}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-lg"
                        >
                          Cerrar sesión
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link to="/login" className="bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-800 text-base">Iniciar sesión</Link>
                    <Link to="/register" className="bg-green-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-600 text-base">Crear cuenta</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Modal de login si no está logueado */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Inicia sesión</h2>
            <p className="mb-6 text-gray-600">Debes iniciar sesión para acceder a esta sección.</p>
            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">Ir a Login</Link>
            <button
              className="block w-full mt-4 text-gray-500 hover:text-gray-700 underline"
              onClick={() => setShowLoginModal(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;