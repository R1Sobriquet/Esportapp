import React from 'react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Politique de Confidentialité</h1>
          
          <div className="prose prose-invert max-w-none">
            <h2>1. Informations collectées</h2>
            <p>Nous collectons les informations suivantes :</p>
            <ul>
              <li><strong>Informations d'inscription :</strong> email, nom d'utilisateur</li>
              <li><strong>Informations de profil :</strong> bio, région, jeux préférés</li>
              <li><strong>Données d'utilisation :</strong> interactions, messages (chiffrés)</li>
              <li><strong>Données techniques :</strong> adresse IP, type de navigateur</li>
            </ul>

            <h2>2. Utilisation des données</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul>
              <li>Fournir et améliorer nos services</li>
              <li>Vous mettre en relation avec d'autres joueurs</li>
              <li>Assurer la sécurité de la plateforme</li>
              <li>Vous envoyer des notifications importantes</li>
            </ul>

            <h2>3. Partage des données</h2>
            <p>
              Nous ne vendons jamais vos données personnelles. Nous pouvons partager 
              des informations dans les cas suivants :
            </p>
            <ul>
              <li>Avec votre consentement explicite</li>
              <li>Pour respecter la loi ou répondre aux autorités</li>
              <li>Pour protéger nos droits ou ceux d'autres utilisateurs</li>
            </ul>

            <h2>4. Cookies et technologies similaires</h2>
            <p>
              Nous utilisons des cookies pour améliorer votre expérience et analyser 
              l'utilisation de notre site. Vous pouvez désactiver les cookies dans 
              votre navigateur.
            </p>

            <h2>5. Sécurité des données</h2>
            <p>
              Nous mettons en place des mesures de sécurité appropriées pour protéger 
              vos données contre tout accès non autorisé, modification ou suppression.
            </p>

            <h2>6. Vos droits</h2>
            <p>Conformément au RGPD, vous avez le droit de :</p>
            <ul>
              <li>Accéder à vos données personnelles</li>
              <li>Rectifier ou supprimer vos données</li>
              <li>Limiter le traitement de vos données</li>
              <li>Vous opposer au traitement</li>
              <li>Portabilité de vos données</li>
            </ul>

            <h2>7. Conservation des données</h2>
            <p>
              Nous conservons vos données tant que votre compte est actif ou 
              selon les exigences légales. Vous pouvez supprimer votre compte à tout moment.
            </p>

            <h2>8. Modifications</h2>
            <p>
              Cette politique peut être mise à jour. Nous vous notifierons 
              des changements importants par email ou via la plateforme.
            </p>

            <h2>9. Contact</h2>
            <p>
              Pour toute question sur cette politique ou pour exercer vos droits : 
              <a href="mailto:privacy@gameconnect.com" className="text-blue-400 hover:underline">
                privacy@gameconnect.com
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