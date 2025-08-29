import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Games from '../pages/Games';
import Matching from '../pages/Matching';
import Messages from '../pages/Messages';
import Forum from '../pages/Forum';

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
                <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
                <Link to="/matching" className="text-gray-300 hover:text-white">Matching</Link>
                <Link to="/games" className="text-gray-300 hover:text-white">Games</Link>
                <Link to="/messages" className="text-gray-300 hover:text-white">Messages</Link>
                <Link to="/forum" className="text-gray-300 hover:text-white">Forum</Link>
                <Link to="/profile" className="text-gray-300 hover:text-white">Profile</Link>
                <button
                  onClick={logout}
                  className="text-gray-300 hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
                <Link to="/register" className="text-blue-400 hover:text-blue-300">Sign Up</Link>
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
        <div className="min-h-screen bg-gray-900">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/games" element={<Games />} />
            <Route path="/matching" element={<Matching />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/forum" element={<Forum />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;