/**
 * SearchBar Component
 * Global search with autocomplete suggestions
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAPI } from '../../services';
import { Avatar } from './Avatar';

const SearchBar = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ players: [], games: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Debounced search for suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions({ players: [], games: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await searchAPI.getSuggestions(query);
        setSuggestions(response.data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    const totalItems = suggestions.players.length + suggestions.games.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        // Select highlighted item
        if (selectedIndex < suggestions.players.length) {
          const player = suggestions.players[selectedIndex];
          navigate(`/messages?user=${player.id}&username=${encodeURIComponent(player.username)}`);
        } else {
          const gameIndex = selectedIndex - suggestions.players.length;
          const game = suggestions.games[gameIndex];
          navigate(`/games?search=${encodeURIComponent(game.name)}`);
        }
        setQuery('');
        setIsOpen(false);
      } else if (query.length >= 2) {
        // Search with current query
        navigate(`/search?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (type, item) => {
    if (type === 'player') {
      navigate(`/messages?user=${item.id}&username=${encodeURIComponent(item.username)}`);
    } else {
      navigate(`/games?search=${encodeURIComponent(item.name)}`);
    }
    setQuery('');
    setIsOpen(false);
  };

  const hasSuggestions = suggestions.players.length > 0 || suggestions.games.length > 0;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher..."
          className="w-full pl-10 pr-4 py-2 bg-gray-900/80 border border-primary/30 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          {loading ? (
            <div className="w-4 h-4 border-2 border-gray-500 border-t-primary-light rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && hasSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-primary/30 rounded-lg shadow-lg shadow-black/50 overflow-hidden z-50 animate-fade-in">
          {/* Players */}
          {suggestions.players.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-800/50">
                Joueurs
              </div>
              {suggestions.players.map((player, index) => (
                <button
                  key={player.id}
                  onClick={() => handleSelect('player', player)}
                  className={`w-full px-3 py-2 flex items-center gap-3 transition-colors text-left ${
                    selectedIndex === index
                      ? 'bg-primary/20 text-white'
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <Avatar src={player.avatar_url} username={player.username} size={32} />
                  <span className="truncate">{player.username}</span>
                </button>
              ))}
            </div>
          )}

          {/* Games */}
          {suggestions.games.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-800/50">
                Jeux
              </div>
              {suggestions.games.map((game, index) => {
                const itemIndex = suggestions.players.length + index;
                return (
                  <button
                    key={game.id}
                    onClick={() => handleSelect('game', game)}
                    className={`w-full px-3 py-2 flex items-center gap-3 transition-colors text-left ${
                      selectedIndex === itemIndex
                        ? 'bg-primary/20 text-white'
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    {game.icon_url ? (
                      <img src={game.icon_url} alt={game.name} className="w-8 h-8 rounded" />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-primary rounded flex items-center justify-center text-sm">
                        🎮
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="truncate block">{game.name}</span>
                      <span className="text-xs text-gray-500">{game.player_count} joueurs</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Search all */}
          {query.length >= 2 && (
            <button
              onClick={() => {
                navigate(`/search?q=${encodeURIComponent(query)}`);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-sm text-primary-light hover:bg-gray-800 transition-colors text-center border-t border-gray-800"
            >
              Voir tous les résultats pour "{query}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
