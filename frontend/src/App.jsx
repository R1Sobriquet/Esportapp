// frontend/src/App.jsx - Sans Forum
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Footer from './components/Footer';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Games from '../pages/Games';
import Matching from '../pages/Matching';
import Messages from '../pages/Messages';
import Terms from '../pages/Terms';
import Privacy from '../pages/Privacy';
import Legal from '../pages/Legal';

function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-blue-400">
            GameConnect
          </Link>
          
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Accueil
                </Link>
                <Link to="/matching" className="text-gray-300 hover:text-white transition-colors">
                  Matching
                </Link>
                <Link to="/games" className="text-gray-300 hover:text-white transition-colors">
                  Jeux
                </Link>
                <Link to="/messages" className="text-gray-300 hover:text-white transition-colors">
                  Messages
                </Link>
                <Link to="/profile" className="text-gray-300 hover:text-white transition-colors">
                  Profil
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  Connexion
                </Link>
                <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900 flex flex-col">
          <Navigation />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/games" element={<Games />} />
              <Route path="/matching" element={<Matching />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/legal" element={<Legal />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;