import React from 'react';

const SECTION_TITLE = 'text-base font-bold text-sky-600 dark:text-neon-cyan mt-6 mb-2';
const BODY = 'text-sm text-slate-700 dark:text-slate-300 leading-relaxed';
const INFO_BOX = 'bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 rounded-xl p-5 space-y-1.5 my-3';

export default function Legal() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold mb-8 bg-gradient-to-r from-sky-500 to-neon-violet dark:from-neon-cyan dark:to-neon-violet bg-clip-text text-transparent">
            Mentions Légales
          </h1>

          <div className="bg-white dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/8 rounded-2xl p-7 shadow-sm dark:shadow-glass space-y-1">
            <h2 className={SECTION_TITLE}>Informations sur l'éditeur</h2>
            <div className={INFO_BOX}>
              {[
                ['Nom', 'GameConnect'],
                ['Forme juridique', '[À compléter]'],
                ['Adresse', '[À compléter]'],
                ['Email', 'contact@gameconnect.com'],
                ['Téléphone', '[À compléter]'],
              ].map(([key, val]) => (
                <p key={key} className={BODY}><strong className="text-slate-900 dark:text-white">{key} :</strong> {val}</p>
              ))}
            </div>

            <h2 className={SECTION_TITLE}>Hébergement</h2>
            <div className={INFO_BOX}>
              <p className={BODY}><strong className="text-slate-900 dark:text-white">Hébergeur :</strong> [À compléter — ex : OVH, AWS, etc.]</p>
              <p className={BODY}><strong className="text-slate-900 dark:text-white">Adresse :</strong> [À compléter]</p>
            </div>

            <h2 className={SECTION_TITLE}>Propriété intellectuelle</h2>
            <p className={BODY}>
              Le site GameConnect et tous ses éléments (textes, images, vidéos, etc.)
              sont protégés par le droit d'auteur et la propriété intellectuelle.
            </p>

            <h2 className={SECTION_TITLE}>Marques et logos de jeux</h2>
            <p className={BODY}>
              Les marques, logos et noms des jeux vidéo mentionnés sur ce site appartiennent à leurs propriétaires respectifs :
            </p>
            <ul className="list-disc list-inside space-y-1 my-2">
              {['Valorant® — Riot Games, Inc.', 'Counter-Strike® — Valve Corporation', 'League of Legends® — Riot Games, Inc.', 'Overwatch® — Blizzard Entertainment, Inc.'].map(item => (
                <li key={item} className={BODY}>{item}</li>
              ))}
            </ul>

            <h2 className={SECTION_TITLE}>Limitation de responsabilité</h2>
            <p className={BODY}>
              GameConnect ne peut être tenu responsable des dommages directs ou indirects
              résultant de l'utilisation du site ou de l'impossibilité de l'utiliser.
            </p>

            <h2 className={SECTION_TITLE}>Droit applicable</h2>
            <p className={BODY}>
              Le présent site est soumis au droit français. En cas de litige,
              les tribunaux français seront seuls compétents.
            </p>

            <h2 className={SECTION_TITLE}>CNIL</h2>
            <p className={BODY}>
              Conformément à la loi Informatique et Libertés du 6 janvier 1978,
              vous disposez d'un droit d'accès, de rectification et de suppression
              des données vous concernant.
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
