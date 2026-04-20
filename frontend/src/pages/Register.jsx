import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const INPUT = 'w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-neon-cyan/60 focus:border-transparent transition-all text-sm';
const LABEL = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '', username: '', password: '', confirmPassword: '',
    region: '', date_of_birth: '', bio: '', discord_username: '',
    skill_level: 'beginner', looking_for: 'teammates'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validateStep1 = () => {
    if (!formData.email || !formData.username || !formData.password) {
      setError('Tous les champs sont requis'); return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas'); return false;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères'); return false;
    }
    setError(''); return true;
  };

  const handleNextStep = () => { if (validateStep1()) setCurrentStep(2); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register({
      email: formData.email,
      username: formData.username,
      password: formData.password,
      profile: {
        region: formData.region,
        date_of_birth: formData.date_of_birth,
        bio: formData.bio,
        discord_username: formData.discord_username,
        skill_level: formData.skill_level,
        looking_for: formData.looking_for,
        profile_visibility: 'public',
        show_stats: true,
        allow_friend_requests: true
      }
    });
    if (result.success) navigate('/');
    else setError(result.error || 'Échec de l\'inscription');
    setLoading(false);
  };

  const skillLevels = [
    { value: 'beginner', label: 'Débutant', description: 'Je commence à jouer' },
    { value: 'intermediate', label: 'Intermédiaire', description: 'Je connais les bases' },
    { value: 'advanced', label: 'Avancé', description: 'Joueur compétitif' },
    { value: 'expert', label: 'Expert', description: 'Niveau pro' },
  ];

  const lookingForOptions = [
    { value: 'teammates', label: 'Coéquipiers', icon: '🎮' },
    { value: 'mentor', label: 'Mentor', icon: '🎓' },
    { value: 'casual_friends', label: 'Amis Casual', icon: '😊' },
    { value: 'competitive_team', label: 'Équipe Compétitive', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/8 rounded-3xl shadow-glass-light dark:shadow-glass p-8 animate-fade-in">

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Créer ton compte</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Rejoins la communauté gaming</p>

            {/* Progress bar */}
            <div className="flex gap-2 justify-center mt-5">
              {[1, 2].map(step => (
                <div
                  key={step}
                  className={`h-1.5 w-20 rounded-full transition-all duration-500 ${
                    currentStep >= step
                      ? 'bg-gradient-neon shadow-glow-cyan'
                      : 'bg-slate-200 dark:bg-white/10'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Étape {currentStep} / 2</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {currentStep === 1 ? (
              <>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Informations du compte</h3>

                <div>
                  <label className={LABEL}>Adresse email</label>
                  <input name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className={INPUT} placeholder="ton@email.com" />
                </div>
                <div>
                  <label className={LABEL}>Nom d'utilisateur</label>
                  <input name="username" type="text" autoComplete="username" required value={formData.username} onChange={handleChange} className={INPUT} placeholder="Choisis un pseudo unique" />
                </div>
                <div>
                  <label className={LABEL}>Mot de passe</label>
                  <input name="password" type="password" autoComplete="new-password" required value={formData.password} onChange={handleChange} className={INPUT} placeholder="Au moins 6 caractères" />
                </div>
                <div>
                  <label className={LABEL}>Confirmer le mot de passe</label>
                  <input name="confirmPassword" type="password" autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange} className={INPUT} placeholder="Confirme ton mot de passe" />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-gradient-neon py-3 rounded-xl font-bold text-white shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all hover:scale-[1.02] mt-2"
                >
                  Étape suivante →
                </button>
              </>
            ) : (
              <>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Informations du profil</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Région</label>
                    <input name="region" type="text" value={formData.region} onChange={handleChange} className={INPUT} placeholder="Europe, NA..." />
                  </div>
                  <div>
                    <label className={LABEL}>Date de naissance</label>
                    <input name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} className={INPUT} />
                  </div>
                </div>

                <div>
                  <label className={LABEL}>Discord (optionnel)</label>
                  <input name="discord_username" type="text" value={formData.discord_username} onChange={handleChange} className={INPUT} placeholder="TonNom#1234" />
                </div>

                <div>
                  <label className={LABEL}>Bio (optionnel)</label>
                  <textarea
                    name="bio"
                    rows={2}
                    value={formData.bio}
                    onChange={handleChange}
                    className={INPUT + ' resize-none'}
                    placeholder="Parle-nous de toi..."
                  />
                </div>

                {/* Skill Level */}
                <div>
                  <label className={LABEL}>Niveau de compétence</label>
                  <div className="grid grid-cols-2 gap-2">
                    {skillLevels.map(level => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, skill_level: level.value }))}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          formData.skill_level === level.value
                            ? 'bg-gradient-neon border-transparent shadow-glow-cyan'
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-sky-300 dark:hover:border-neon-cyan/30'
                        }`}
                      >
                        <div className="font-semibold text-sm text-slate-800 dark:text-white">{level.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Looking For */}
                <div>
                  <label className={LABEL}>Je recherche</label>
                  <div className="grid grid-cols-2 gap-2">
                    {lookingForOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, looking_for: option.value }))}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          formData.looking_for === option.value
                            ? 'bg-gradient-to-br from-emerald-500 to-green-400 border-transparent shadow-lg shadow-emerald-400/30'
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-sky-300 dark:hover:border-neon-cyan/30'
                        }`}
                      >
                        <div className="text-xl mb-1">{option.icon}</div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-white">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3 px-4 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all"
                  >
                    ← Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-gradient-to-br from-emerald-500 to-green-400 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-400/30 hover:shadow-emerald-400/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Création...
                      </span>
                    ) : 'Créer le compte ✓'}
                  </button>
                </div>
              </>
            )}

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-1">
              Déjà un compte ?{' '}
              <a href="/login" className="text-sky-600 dark:text-neon-cyan hover:text-neon-violet font-semibold transition-colors">
                Connecte-toi ici
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
