import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAPI } from '../../services';
import Avatar from './Avatar';

const SearchBar = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ players: [], games: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        if (selectedIndex < suggestions.players.length) {
          const player = suggestions.players[selectedIndex];
          navigate(`/messages?user=${player.id}&username=${encodeURIComponent(player.username)}`);
        } else {
          const game = suggestions.games[selectedIndex - suggestions.players.length];
          navigate(`/games?search=${encodeURIComponent(game.name)}`);
        }
        setQuery(''); setIsOpen(false);
      } else if (query.length >= 2) {
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
    setQuery(''); setIsOpen(false);
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
          className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-white/8 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-neon-cyan/50 focus:border-transparent transition-all"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
          {loading ? (
            <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-sky-500 dark:border-t-neon-cyan rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {isOpen && hasSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gaming-surface border border-slate-200 dark:border-white/10 rounded-xl shadow-lg dark:shadow-glass overflow-hidden z-50 animate-fade-in">
          {suggestions.players.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide bg-slate-50 dark:bg-white/5">
                Joueurs
              </div>
              {suggestions.players.map((player, index) => (
                <button
                  key={player.id}
                  onClick={() => handleSelect('player', player)}
                  className={`w-full px-3 py-2.5 flex items-center gap-3 transition-colors text-left text-sm ${
                    selectedIndex === index
                      ? 'bg-sky-50 dark:bg-neon-cyan/10 text-sky-700 dark:text-neon-cyan'
                      : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Avatar src={player.avatar_url} username={player.username} size={32} />
                  <span className="truncate font-medium">{player.username}</span>
                </button>
              ))}
            </div>
          )}

          {suggestions.games.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide bg-slate-50 dark:bg-white/5">
                Jeux
              </div>
              {suggestions.games.map((game, index) => {
                const itemIndex = suggestions.players.length + index;
                return (
                  <button
                    key={game.id}
                    onClick={() => handleSelect('game', game)}
                    className={`w-full px-3 py-2.5 flex items-center gap-3 transition-colors text-left text-sm ${
                      selectedIndex === itemIndex
                        ? 'bg-sky-50 dark:bg-neon-cyan/10 text-sky-700 dark:text-neon-cyan'
                        : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {game.icon_url ? (
                      <img src={game.icon_url} alt={game.name} className="w-8 h-8 rounded-lg shrink-0" />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-neon rounded-lg flex items-center justify-center text-sm shrink-0">
                        🎮
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="truncate block font-medium">{game.name}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{game.player_count} joueurs</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {query.length >= 2 && (
            <button
              onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); setIsOpen(false); }}
              className="w-full px-3 py-2.5 text-sm text-sky-600 dark:text-neon-cyan hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-center border-t border-slate-100 dark:border-white/8 font-medium"
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
