import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gaming-surface border-t border-slate-200 dark:border-white/8 text-slate-700 dark:text-slate-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="text-2xl font-extrabold bg-gradient-to-r from-sky-500 to-neon-violet dark:from-neon-cyan dark:to-neon-violet bg-clip-text text-transparent mb-3 block">
              GameConnect
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              La plateforme sociale ultime pour les gamers.
              Trouvez vos coéquipiers parfaits et dominez la compétition ensemble.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wide">Navigation</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/', label: 'Accueil' },
                { to: '/matching', label: 'Matching' },
                { to: '/games', label: 'Jeux' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-neon-cyan transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wide">Support</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: 'mailto:support@gameconnect.com', label: 'Support' },
                { href: 'mailto:contact@gameconnect.com', label: 'Contact' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-neon-cyan transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wide">Légal</h3>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/terms', label: "Conditions d'utilisation" },
                { to: '/privacy', label: 'Politique de confidentialité' },
                { to: '/legal', label: 'Mentions légales' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-neon-cyan transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-white/8 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              &copy; {new Date().getFullYear()} GameConnect. Tous droits réservés.
            </p>
            <div className="flex space-x-4">
              {[
                { label: 'Twitter', path: 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z' },
                { label: 'Discord', path: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z' },
              ].map(({ label, path }) => (
                <a key={label} href="#" aria-label={label} className="text-slate-400 dark:text-slate-500 hover:text-sky-500 dark:hover:text-neon-cyan transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 text-center">
            GameConnect n'est pas affilié à Riot Games, Valve, Blizzard Entertainment ou autres éditeurs de jeux.
            Toutes les marques sont la propriété de leurs détenteurs respectifs.
          </p>
        </div>
      </div>
    </footer>
  );
}
