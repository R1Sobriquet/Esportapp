import React, { useState, useEffect } from 'react';
import { matchingAPI } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';

export default function Matching() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [currentMatches, setCurrentMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');

  useEffect(() => {
    if (user) {
      loadCurrentMatches();
    }
  }, [user]);

  const loadCurrentMatches = async () => {
    try {
      const response = await matchingAPI.getMatches();
      setCurrentMatches(response.data.matches);
    } catch (error) {
      console.error('Failed to load current matches:', error);
    }
  };

  const findMatches = async () => {
    setLoading(true);
    try {
      const response = await matchingAPI.findMatches();
      setMatches(response.data.matches);
    } catch (error) {
      console.error('Failed to find matches:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const acceptMatch = async (matchId) => {
    try {
      await matchingAPI.acceptMatch(matchId);
      await loadCurrentMatches();
      // Remove from potential matches
      setMatches(prev => prev.filter(m => m.match_id !== matchId));
      alert('Match accepted! You can now message this player.');
    } catch (error) {
      console.error('Failed to accept match:', error);
      alert('Failed to accept match: ' + (error.response?.data?.error || error.message));
    }
  };

  const rejectMatch = async (matchId) => {
    try {
      await matchingAPI.rejectMatch(matchId);
      setMatches(prev => prev.filter(m => m.match_id !== matchId));
    } catch (error) {
      console.error('Failed to reject match:', error);
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'rejected': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Gaming Partners</h1>
          <p className="text-gray-400">
            Discover players who match your games, skill level, and playtime preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'discover'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'matches'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            My Matches ({currentMatches.length})
          </button>
        </div>

        {activeTab === 'discover' ? (
          <div>
            <div className="mb-6">
              <button
                onClick={findMatches}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Finding matches...
                  </div>
                ) : (
                  'Find New Matches'
                )}
              </button>
            </div>

            {matches.length > 0 ? (
              <div className="grid gap-6">
                {matches.map((match) => (
                  <div key={match.match_id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={match.avatar_url || '/default-avatar.png'}
                          alt={match.username}
                          className="w-16 h-16 rounded-full"
                        />
                        <div>
                          <h3 className="text-xl font-semibold">{match.username}</h3>
                          <p className="text-gray-400">
                            <span className="capitalize">{match.skill_level}</span> • Looking for{' '}
                            <span className="capitalize">{match.looking_for?.replace('_', ' ')}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`font-semibold ${getMatchScoreColor(match.match_score)}`}>
                              {Math.round(match.match_score)}% match
                            </span>
                            {match.location && (
                              <span className="text-gray-500">• {match.location}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptMatch(match.match_id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => rejectMatch(match.match_id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          Pass
                        </button>
                      </div>
                    </div>
                    
                    {match.bio && (
                      <div className="mt-4">
                        <p className="text-gray-300 text-sm">{match.bio}</p>
                      </div>
                    )}
                    
                    {match.games && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-400 mb-2">Common Games:</p>
                        <div className="flex flex-wrap gap-2">
                          {match.games.split(',').map((game, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm"
                            >
                              {game.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  🎮
                </div>
                <h3 className="text-xl font-semibold mb-2">Ready to find teammates?</h3>
                <p className="text-gray-400 mb-4">
                  Click "Find New Matches" to discover players who share your gaming interests
                </p>
                {!loading && (
                  <button
                    onClick={findMatches}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                  >
                    Get Started
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* My Matches Tab */
          <div>
            {currentMatches.length > 0 ? (
              <div className="grid gap-6">
                {currentMatches.map((match) => (
                  <div key={match.match_id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={match.avatar_url || '/default-avatar.png'}
                          alt={match.username}
                          className="w-16 h-16 rounded-full"
                        />
                        <div>
                          <h3 className="text-xl font-semibold">{match.username}</h3>
                          <p className="text-gray-400">
                            <span className="capitalize">{match.skill_level}</span> • Looking for{' '}
                            <span className="capitalize">{match.looking_for?.replace('_', ' ')}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`font-semibold ${getMatchScoreColor(match.match_score)}`}>
                              {Math.round(match.match_score)}% match
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(match.status)}`}>
                              {match.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {match.status === 'accepted' && (
                        <a
                          href={`/messages?user=${match.user_id}`}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          Message
                        </a>
                      )}
                    </div>
                    
                    {match.bio && (
                      <div className="mt-4">
                        <p className="text-gray-300 text-sm">{match.bio}</p>
                      </div>
                    )}
                    
                    {match.games && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-400 mb-2">Common Games:</p>
                        <div className="flex flex-wrap gap-2">
                          {match.games.split(',').map((game, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm"
                            >
                              {game.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 text-sm text-gray-500">
                      Matched on {new Date(match.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  🤝
                </div>
                <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
                <p className="text-gray-400 mb-4">
                  Start discovering new teammates to build your gaming network
                </p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  Find Matches
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}