import React from 'react';

const SECTION_TITLE = 'text-base font-bold text-sky-600 dark:text-neon-cyan mt-6 mb-2';
const BODY = 'text-sm text-slate-700 dark:text-slate-300 leading-relaxed';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold mb-8 bg-gradient-to-r from-sky-500 to-neon-violet dark:from-neon-cyan dark:to-neon-violet bg-clip-text text-transparent">
            Politique de Confidentialité
          </h1>

          <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/8 rounded-2xl p-7 shadow-sm dark:shadow-glass space-y-1">
            <h2 className={SECTION_TITLE}>1. Informations collectées</h2>
            <p className={BODY}>Nous collectons les informations suivantes :</p>
            <ul className="list-disc list-inside space-y-1 my-2">
              {[
                ['Informations d\'inscription', 'email, nom d\'utilisateur'],
                ['Informations de profil', 'bio, région, jeux préférés'],
                ['Données d\'utilisation', 'interactions, messages (chiffrés)'],
                ['Données techniques', 'adresse IP, type de navigateur'],
              ].map(([key, val]) => (
                <li key={key} className={BODY}><strong className="text-slate-900 dark:text-white">{key} :</strong> {val}</li>
              ))}
            </ul>

            <h2 className={SECTION_TITLE}>2. Utilisation des données</h2>
            <p className={BODY}>Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside space-y-1 my-2">
              {['Fournir et améliorer nos services', 'Vous mettre en relation avec d\'autres joueurs', 'Assurer la sécurité de la plateforme', 'Vous envoyer des notifications importantes'].map(item => (
                <li key={item} className={BODY}>{item}</li>
              ))}
            </ul>

            <h2 className={SECTION_TITLE}>3. Partage des données</h2>
            <p className={BODY}>
              Nous ne vendons jamais vos données personnelles. Nous pouvons partager
              des informations dans les cas suivants :
            </p>
            <ul className="list-disc list-inside space-y-1 my-2">
              {['Avec votre consentement explicite', 'Pour respecter la loi ou répondre aux autorités', 'Pour protéger nos droits ou ceux d\'autres utilisateurs'].map(item => (
                <li key={item} className={BODY}>{item}</li>
              ))}
            </ul>

            <h2 className={SECTION_TITLE}>4. Cookies et technologies similaires</h2>
            <p className={BODY}>
              Nous utilisons des cookies pour améliorer votre expérience et analyser
              l'utilisation de notre site. Vous pouvez désactiver les cookies dans votre navigateur.
            </p>

            <h2 className={SECTION_TITLE}>5. Sécurité des données</h2>
            <p className={BODY}>
              Nous mettons en place des mesures de sécurité appropriées pour protéger
              vos données contre tout accès non autorisé, modification ou suppression.
            </p>

            <h2 className={SECTION_TITLE}>6. Vos droits</h2>
            <p className={BODY}>Conformément au RGPD, vous avez le droit de :</p>
            <ul className="list-disc list-inside space-y-1 my-2">
              {['Accéder à vos données personnelles', 'Rectifier ou supprimer vos données', 'Limiter le traitement de vos données', 'Vous opposer au traitement', 'Portabilité de vos données'].map(item => (
                <li key={item} className={BODY}>{item}</li>
              ))}
            </ul>

            <h2 className={SECTION_TITLE}>7. Conservation des données</h2>
            <p className={BODY}>
              Nous conservons vos données tant que votre compte est actif ou
              selon les exigences légales. Vous pouvez supprimer votre compte à tout moment.
            </p>

            <h2 className={SECTION_TITLE}>8. Modifications</h2>
            <p className={BODY}>
              Cette politique peut être mise à jour. Nous vous notifierons
              des changements importants par email ou via la plateforme.
            </p>

            <h2 className={SECTION_TITLE}>9. Contact</h2>
            <p className={BODY}>
              Pour toute question sur cette politique ou pour exercer vos droits :{' '}
              <a href="mailto:privacy@gameconnect.com" className="text-sky-600 dark:text-neon-cyan hover:underline font-medium">
                privacy@gameconnect.com
              </a>
            </p>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-8 pt-4 border-t border-slate-200 dark:border-white/8">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
