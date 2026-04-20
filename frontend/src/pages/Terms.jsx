import React from 'react';

const SECTION_TITLE = 'text-base font-bold text-sky-600 dark:text-neon-cyan mt-6 mb-2';
const BODY = 'text-sm text-slate-700 dark:text-slate-300 leading-relaxed';

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold mb-8 bg-gradient-to-r from-sky-500 to-neon-violet dark:from-neon-cyan dark:to-neon-violet bg-clip-text text-transparent">
            Conditions Générales d'Utilisation
          </h1>

          <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/8 rounded-2xl p-7 shadow-sm dark:shadow-glass space-y-1">
            <h2 className={SECTION_TITLE}>1. Acceptation des conditions</h2>
            <p className={BODY}>
              En utilisant GameConnect, vous acceptez d'être lié par ces conditions d'utilisation.
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </p>

            <h2 className={SECTION_TITLE}>2. Description du service</h2>
            <p className={BODY}>
              GameConnect est une plateforme sociale permettant aux joueurs de se connecter,
              de trouver des coéquipiers et de discuter autour des jeux vidéo.
            </p>

            <h2 className={SECTION_TITLE}>3. Comptes utilisateur</h2>
            <p className={BODY}>
              Pour utiliser certaines fonctionnalités, vous devez créer un compte.
              Vous êtes responsable de maintenir la confidentialité de vos identifiants.
            </p>

            <h2 className={SECTION_TITLE}>4. Conduite des utilisateurs</h2>
            <p className={BODY}>Vous vous engagez à :</p>
            <ul className="list-disc list-inside space-y-1 my-2">
              {['Respecter les autres utilisateurs', 'Ne pas publier de contenu offensant ou illégal', 'Ne pas usurper l\'identité d\'autres personnes', 'Ne pas utiliser le service à des fins commerciales sans autorisation'].map(item => (
                <li key={item} className={BODY}>{item}</li>
              ))}
            </ul>

            <h2 className={SECTION_TITLE}>5. Propriété intellectuelle</h2>
            <p className={BODY}>
              GameConnect respecte les droits de propriété intellectuelle.
              Les marques et logos des jeux appartiennent à leurs propriétaires respectifs.
            </p>

            <h2 className={SECTION_TITLE}>6. Confidentialité</h2>
            <p className={BODY}>
              Votre vie privée est importante pour nous. Consultez notre{' '}
              <a href="/privacy" className="text-sky-600 dark:text-neon-cyan hover:underline font-medium">
                Politique de confidentialité
              </a>{' '}
              pour plus d'informations.
            </p>

            <h2 className={SECTION_TITLE}>7. Limitation de responsabilité</h2>
            <p className={BODY}>
              GameConnect est fourni "tel quel" sans garantie d'aucune sorte.
              Nous ne sommes pas responsables des interactions entre utilisateurs.
            </p>

            <h2 className={SECTION_TITLE}>8. Modifications</h2>
            <p className={BODY}>
              Nous nous réservons le droit de modifier ces conditions à tout moment.
              Les modifications prendront effet dès leur publication.
            </p>

            <h2 className={SECTION_TITLE}>9. Contact</h2>
            <p className={BODY}>
              Pour toute question concernant ces conditions :{' '}
              <a href="mailto:legal@gameconnect.com" className="text-sky-600 dark:text-neon-cyan hover:underline font-medium">
                legal@gameconnect.com
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
