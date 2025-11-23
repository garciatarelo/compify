import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { BuilderProvider } from './context/BuilderContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Builder from './pages/Builder';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <AppProvider>
        <BuilderProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path='/login' element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/builder" element={<Builder />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </div>
        </BuilderProvider>
      </AppProvider>
    </Router>
  );
}

export default App;