import React from 'react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
            Conditions Générales d'Utilisation
          </h1>

          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-primary/20 rounded-xl p-8 shadow-lg prose prose-invert max-w-none">
            <h2 className="text-primary-light">1. Acceptation des conditions</h2>
            <p className="text-gray-300">
              En utilisant GameConnect, vous acceptez d'être lié par ces conditions d'utilisation.
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </p>

            <h2 className="text-primary-light">2. Description du service</h2>
            <p className="text-gray-300">
              GameConnect est une plateforme sociale permettant aux joueurs de se connecter,
              de trouver des coéquipiers et de discuter autour des jeux vidéo.
            </p>

            <h2 className="text-primary-light">3. Comptes utilisateur</h2>
            <p className="text-gray-300">
              Pour utiliser certaines fonctionnalités, vous devez créer un compte.
              Vous êtes responsable de maintenir la confidentialité de vos identifiants.
            </p>

            <h2 className="text-primary-light">4. Conduite des utilisateurs</h2>
            <p className="text-gray-300">Vous vous engagez à :</p>
            <ul className="text-gray-300">
              <li>Respecter les autres utilisateurs</li>
              <li>Ne pas publier de contenu offensant ou illégal</li>
              <li>Ne pas usurper l'identité d'autres personnes</li>
              <li>Ne pas utiliser le service à des fins commerciales sans autorisation</li>
            </ul>

            <h2 className="text-primary-light">5. Propriété intellectuelle</h2>
            <p className="text-gray-300">
              GameConnect respecte les droits de propriété intellectuelle.
              Les marques et logos des jeux appartiennent à leurs propriétaires respectifs.
            </p>

            <h2 className="text-primary-light">6. Confidentialité</h2>
            <p className="text-gray-300">
              Votre vie privée est importante pour nous. Consultez notre
              <a href="/privacy" className="text-primary-light hover:text-white transition-colors ml-1">Politique de confidentialité</a>
              pour plus d'informations.
            </p>

            <h2 className="text-primary-light">7. Limitation de responsabilité</h2>
            <p className="text-gray-300">
              GameConnect est fourni "tel quel" sans garantie d'aucune sorte.
              Nous ne sommes pas responsables des interactions entre utilisateurs.
            </p>

            <h2 className="text-primary-light">8. Modifications</h2>
            <p className="text-gray-300">
              Nous nous réservons le droit de modifier ces conditions à tout moment.
              Les modifications prendront effet dès leur publication.
            </p>

            <h2 className="text-primary-light">9. Contact</h2>
            <p className="text-gray-300">
              Pour toute question concernant ces conditions, contactez-nous à :
              <a href="mailto:legal@gameconnect.com" className="text-primary-light hover:text-white transition-colors ml-1">
                legal@gameconnect.com
              </a>
            </p>

            <p className="text-sm text-gray-500 mt-8 border-t border-primary/20 pt-4">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
