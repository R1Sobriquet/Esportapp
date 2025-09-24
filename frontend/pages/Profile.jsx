import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { profileAPI, gamesAPI } from '../src/services/api';
import Avatar from '../src/components/Avatar';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({});

  const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const lookingForOptions = ['teammates', 'mentor', 'casual_friends', 'competitive_team'];
  const visibilityOptions = ['public', 'friends', 'private'];
  const gameModes = ['competitive', 'casual', 'any'];
  const playtimes = ['morning', 'afternoon', 'evening', 'night', 'any'];

  useEffect(() => {
    if (user) {
      loadProfile();
      loadAllGames();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      setProfile(response.data.profile);
      setGames(response.data.games);
      setEditForm({
        ...response.data.profile,
        preferences: response.data.preferences
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllGames = async () => {
    try {
      const response = await gamesAPI.getAllGames();
      setAllGames(response.data);
    } catch (error) {
      console.error('Failed to load games:', error);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setEditForm(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === 'checkbox' 
            ? (checked 
                ? [...(prev.preferences[prefKey] || []), value]
                : (prev.preferences[prefKey] || []).filter(v => v !== value))
            : value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await profileAPI.updateProfile(editForm);
      await loadProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  const addGameToProfile = async (gameId) => {
    try {
      await gamesAPI.addUserGame({
        game_id: gameId,
        skill_level: 'beginner',
        is_favorite: false
      });
      await loadProfile();
    } catch (error) {
      console.error('Failed to add game:', error);
      alert('Failed to add game: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Profile not found</h2>
          <p className="text-gray-400">There was an error loading your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar avec composant Avatar */}
              <Avatar 
                src={profile.avatar_url}
                username={profile.username}
                size={96}
                className="ring-2 ring-blue-500/20"
              />
              <div>
                <h1 className="text-3xl font-bold">
                  {profile.username}
                </h1>
                <p className="text-gray-400">@{profile.username}</p>
                {profile.region && (
                  <p className="text-gray-400 mt-1">📍 {profile.region}</p>
                )}
                <div className="flex gap-4 mt-2">
                  <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">
                    {profile.skill_level}
                  </span>
                  <span className="px-3 py-1 bg-green-600 rounded-full text-sm">
                    Looking for {profile.looking_for?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
          
          {profile.bio && (
            <div className="mt-4">
              <p className="text-gray-300">{profile.bio}</p>
            </div>
          )}
        </div>

        {isEditing ? (
          /* Edit Form */
          <form onSubmit={handleSaveProfile} className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Region
                </label>
                <input
                  type="text"
                  name="region"
                  value={editForm.region || ''}
                  onChange={handleEditChange}
                  placeholder="e.g., Europe, NA, Asia"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={editForm.date_of_birth || ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Avatar URL
                </label>
                <input
                  type="url"
                  name="avatar_url"
                  value={editForm.avatar_url || ''}
                  onChange={handleEditChange}
                  placeholder="URL de votre image de profil"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Timezone
                </label>
                <input
                  type="text"
                  name="timezone"
                  value={editForm.timezone || ''}
                  onChange={handleEditChange}
                  placeholder="e.g., Europe/Paris, America/New_York"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Discord Username
                </label>
                <input
                  type="text"
                  name="discord_username"
                  value={editForm.discord_username || ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Steam ID
                </label>
                <input
                  type="text"
                  name="steam_id"
                  value={editForm.steam_id || ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Twitch Username
                </label>
                <input
                  type="text"
                  name="twitch_username"
                  value={editForm.twitch_username || ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Skill Level
                </label>
                <select
                  name="skill_level"
                  value={editForm.skill_level || 'beginner'}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  {skillLevels.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Looking For
                </label>
                <select
                  name="looking_for"
                  value={editForm.looking_for || 'teammates'}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  {lookingForOptions.map(option => (
                    <option key={option} value={option}>
                      {option.replace('_', ' ').charAt(0).toUpperCase() + option.replace('_', ' ').slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profile Visibility
                </label>
                <select
                  name="profile_visibility"
                  value={editForm.profile_visibility || 'public'}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  {visibilityOptions.map(option => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                rows={3}
                value={editForm.bio || ''}
                onChange={handleEditChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                placeholder="Tell others about yourself and your gaming style..."
              />
            </div>
            
            <div className="mt-6 flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="show_stats"
                  checked={editForm.show_stats !== false}
                  onChange={handleEditChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Show Stats</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="allow_friend_requests"
                  checked={editForm.allow_friend_requests !== false}
                  onChange={handleEditChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Allow Friend Requests</span>
              </label>
            </div>
            
            <div className="mt-6 flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* Display Mode */
          <div className="space-y-8">
            {/* Profile Details */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Profile Details</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {profile.region && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                      Region
                    </h3>
                    <p className="mt-1">{profile.region}</p>
                  </div>
                )}
                
                {profile.timezone && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                      Timezone
                    </h3>
                    <p className="mt-1">{profile.timezone}</p>
                  </div>
                )}
                
                {profile.discord_username && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                      Discord
                    </h3>
                    <p className="mt-1">{profile.discord_username}</p>
                  </div>
                )}
                
                {profile.steam_id && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                      Steam ID
                    </h3>
                    <p className="mt-1">{profile.steam_id}</p>
                  </div>
                )}
                
                {profile.twitch_username && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                      Twitch
                    </h3>
                    <p className="mt-1">{profile.twitch_username}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Games */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Games</h2>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addGameToProfile(parseInt(e.target.value));
                      e.target.value = '';
                    }
                  }}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
                >
                  <option value="">Add Game</option>
                  {allGames
                    .filter(game => !games.find(g => g.id === game.id))
                    .map(game => (
                      <option key={game.id} value={game.id}>
                        {game.name}
                      </option>
                    ))}
                </select>
              </div>
              
              {games.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {games.map(game => (
                    <div key={game.id} className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{game.name}</h3>
                        {game.is_favorite && <span className="text-yellow-400">⭐</span>}
                      </div>
                      <p className="text-sm text-gray-400">{game.category}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="text-gray-400">Skill:</span> {game.skill_level}
                        </p>
                        {game.rank && (
                          <p className="text-sm">
                            <span className="text-gray-400">Rank:</span> {game.rank}
                          </p>
                        )}
                        {game.hours_played > 0 && (
                          <p className="text-sm">
                            <span className="text-gray-400">Hours:</span> {game.hours_played}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No games added yet. Add some games to help others find you!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}