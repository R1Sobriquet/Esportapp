import React from 'react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Conditions Générales d'Utilisation</h1>
          
          <div className="prose prose-invert max-w-none">
            <h2>1. Acceptation des conditions</h2>
            <p>
              En utilisant GameConnect, vous acceptez d'être lié par ces conditions d'utilisation. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </p>

            <h2>2. Description du service</h2>
            <p>
              GameConnect est une plateforme sociale permettant aux joueurs de se connecter, 
              de trouver des coéquipiers et de discuter autour des jeux vidéo.
            </p>

            <h2>3. Comptes utilisateur</h2>
            <p>
              Pour utiliser certaines fonctionnalités, vous devez créer un compte. 
              Vous êtes responsable de maintenir la confidentialité de vos identifiants.
            </p>

            <h2>4. Conduite des utilisateurs</h2>
            <p>Vous vous engagez à :</p>
            <ul>
              <li>Respecter les autres utilisateurs</li>
              <li>Ne pas publier de contenu offensant ou illégal</li>
              <li>Ne pas usurper l'identité d'autres personnes</li>
              <li>Ne pas utiliser le service à des fins commerciales sans autorisation</li>
            </ul>

            <h2>5. Propriété intellectuelle</h2>
            <p>
              GameConnect respecte les droits de propriété intellectuelle. 
              Les marques et logos des jeux appartiennent à leurs propriétaires respectifs.
            </p>

            <h2>6. Confidentialité</h2>
            <p>
              Votre vie privée est importante pour nous. Consultez notre 
              <a href="/privacy" className="text-blue-400 hover:underline">Politique de confidentialité</a> 
              pour plus d'informations.
            </p>

            <h2>7. Limitation de responsabilité</h2>
            <p>
              GameConnect est fourni "tel quel" sans garantie d'aucune sorte. 
              Nous ne sommes pas responsables des interactions entre utilisateurs.
            </p>

            <h2>8. Modifications</h2>
            <p>
              Nous nous réservons le droit de modifier ces conditions à tout moment. 
              Les modifications prendront effet dès leur publication.
            </p>

            <h2>9. Contact</h2>
            <p>
              Pour toute question concernant ces conditions, contactez-nous à : 
              <a href="mailto:legal@gameconnect.com" className="text-blue-400 hover:underline">
                legal@gameconnect.com
              </a>
            </p>

            <p className="text-sm text-gray-500 mt-8">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}