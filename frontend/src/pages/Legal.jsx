import React from 'react';

export default function Legal() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Mentions Légales</h1>
          
          <div className="prose prose-invert max-w-none">
            <h2>Informations sur l'éditeur</h2>
            <div className="bg-gray-800 p-6 rounded-lg">
              <p><strong>Nom :</strong> GameConnect</p>
              <p><strong>Forme juridique :</strong> [À compléter]</p>
              <p><strong>Adresse :</strong> [À compléter]</p>
              <p><strong>Email :</strong> contact@gameconnect.com</p>
              <p><strong>Téléphone :</strong> [À compléter]</p>
            </div>

            <h2>Hébergement</h2>
            <div className="bg-gray-800 p-6 rounded-lg">
              <p><strong>Hébergeur :</strong> [À compléter - ex: OVH, AWS, etc.]</p>
              <p><strong>Adresse :</strong> [À compléter]</p>
            </div>

            <h2>Propriété intellectuelle</h2>
            <p>
              Le site GameConnect et tous ses éléments (textes, images, vidéos, etc.) 
              sont protégés par le droit d'auteur et la propriété intellectuelle.
            </p>

            <h2>Marques et logos de jeux</h2>
            <p>
              Les marques, logos et noms des jeux vidéo mentionnés sur ce site 
              appartiennent à leurs propriétaires respectifs :
            </p>
            <ul>
              <li>Valorant® - Riot Games, Inc.</li>
              <li>Counter-Strike® - Valve Corporation</li>
              <li>League of Legends® - Riot Games, Inc.</li>
              <li>Overwatch® - Blizzard Entertainment, Inc.</li>
              <li>[Autres jeux selon votre catalogue]</li>
            </ul>

            <h2>Limitation de responsabilité</h2>
            <p>
              GameConnect ne peut être tenu responsable des dommages directs ou 
              indirects résultant de l'utilisation du site ou de l'impossibilité 
              de l'utiliser.
            </p>

            <h2>Droit applicable</h2>
            <p>
              Le présent site est soumis au droit français. En cas de litige, 
              les tribunaux français seront seuls compétents.
            </p>

            <h2>Commission Nationale Informatique et Libertés (CNIL)</h2>
            <p>
              Conformément à la loi Informatique et Libertés du 6 janvier 1978, 
              vous disposez d'un droit d'accès, de rectification et de suppression 
              des données vous concernant.
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