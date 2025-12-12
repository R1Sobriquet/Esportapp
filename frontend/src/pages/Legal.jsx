import React from 'react';

export default function Legal() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
            Mentions Légales
          </h1>

          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-primary/20 rounded-xl p-8 shadow-lg prose prose-invert max-w-none">
            <h2 className="text-primary-light">Informations sur l'éditeur</h2>
            <div className="bg-gray-900/60 border border-primary/10 p-6 rounded-lg">
              <p className="text-gray-300"><strong className="text-white">Nom :</strong> GameConnect</p>
              <p className="text-gray-300"><strong className="text-white">Forme juridique :</strong> [À compléter]</p>
              <p className="text-gray-300"><strong className="text-white">Adresse :</strong> [À compléter]</p>
              <p className="text-gray-300"><strong className="text-white">Email :</strong> contact@gameconnect.com</p>
              <p className="text-gray-300"><strong className="text-white">Téléphone :</strong> [À compléter]</p>
            </div>

            <h2 className="text-primary-light">Hébergement</h2>
            <div className="bg-gray-900/60 border border-primary/10 p-6 rounded-lg">
              <p className="text-gray-300"><strong className="text-white">Hébergeur :</strong> [À compléter - ex: OVH, AWS, etc.]</p>
              <p className="text-gray-300"><strong className="text-white">Adresse :</strong> [À compléter]</p>
            </div>

            <h2 className="text-primary-light">Propriété intellectuelle</h2>
            <p className="text-gray-300">
              Le site GameConnect et tous ses éléments (textes, images, vidéos, etc.)
              sont protégés par le droit d'auteur et la propriété intellectuelle.
            </p>

            <h2 className="text-primary-light">Marques et logos de jeux</h2>
            <p className="text-gray-300">
              Les marques, logos et noms des jeux vidéo mentionnés sur ce site
              appartiennent à leurs propriétaires respectifs :
            </p>
            <ul className="text-gray-300">
              <li>Valorant® - Riot Games, Inc.</li>
              <li>Counter-Strike® - Valve Corporation</li>
              <li>League of Legends® - Riot Games, Inc.</li>
              <li>Overwatch® - Blizzard Entertainment, Inc.</li>
              <li>[Autres jeux selon votre catalogue]</li>
            </ul>

            <h2 className="text-primary-light">Limitation de responsabilité</h2>
            <p className="text-gray-300">
              GameConnect ne peut être tenu responsable des dommages directs ou
              indirects résultant de l'utilisation du site ou de l'impossibilité
              de l'utiliser.
            </p>

            <h2 className="text-primary-light">Droit applicable</h2>
            <p className="text-gray-300">
              Le présent site est soumis au droit français. En cas de litige,
              les tribunaux français seront seuls compétents.
            </p>

            <h2 className="text-primary-light">Commission Nationale Informatique et Libertés (CNIL)</h2>
            <p className="text-gray-300">
              Conformément à la loi Informatique et Libertés du 6 janvier 1978,
              vous disposez d'un droit d'accès, de rectification et de suppression
              des données vous concernant.
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
