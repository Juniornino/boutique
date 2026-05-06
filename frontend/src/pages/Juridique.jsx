import React from 'react';

export function Juridique() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-14 animate-in fade-in slide-in-from-right-8 duration-500">
      <h1 className="text-3xl md:text-4xl font-black tracking-tight">Juridique</h1>
      <p className="mt-3 text-slate-600 max-w-2xl">
        Mentions légales, conditions générales et politique de confidentialité. Remplacez les champs entre crochets par vos informations.
      </p>

      <div className="mt-8 space-y-6">
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-black text-lg">Mentions légales</h2>
          <div className="mt-3 text-sm text-slate-700 space-y-2">
            <p><span className="font-black">Éditeur</span> : [Nom de la société / boutique]</p>
            <p><span className="font-black">Adresse</span> : [Adresse complète]</p>
            <p><span className="font-black">Email</span> : [Email de contact]</p>
            <p><span className="font-black">Téléphone</span> : [Téléphone]</p>
            <p><span className="font-black">Hébergement</span> : [Nom / adresse de l’hébergeur]</p>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Texte à adapter selon votre statut (entreprise, auto-entrepreneur, etc.).
          </p>
        </section>
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-black text-lg">CGV</h2>
          <div className="mt-3 text-sm text-slate-700 space-y-3">
            <p>
              <span className="font-black">Produit</span> : licences numériques / clés d’activation livrées de façon digitale.
            </p>
            <p>
              <span className="font-black">Livraison</span> : la clé est mise à disposition dans l’espace client après validation du paiement.
            </p>
            <p>
              <span className="font-black">Utilisation</span> : l’acheteur vérifie la compatibilité (édition, version, système).
            </p>
            <p>
              <span className="font-black">Support</span> : assistance via WhatsApp / email selon disponibilité.
            </p>
            <p className="text-xs text-slate-500">
              Pour un document juridique complet (droit local, droit de rétractation, exceptions sur contenus numériques), faites valider par un juriste.
            </p>
          </div>
        </section>
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-black text-lg">Confidentialité</h2>
          <div className="mt-3 text-sm text-slate-700 space-y-3">
            <p>
              <span className="font-black">Données collectées</span> : email, informations de compte, historique de commandes.
            </p>
            <p>
              <span className="font-black">Finalité</span> : gestion des commandes, support, prévention de fraude, amélioration du service.
            </p>
            <p>
              <span className="font-black">Conservation</span> : [Durée de conservation] (à définir selon vos obligations).
            </p>
            <p>
              <span className="font-black">Droits</span> : accès, rectification, suppression (selon la réglementation applicable).
            </p>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-black text-lg">Politique de retour / remboursement</h2>
          <div className="mt-3 text-sm text-slate-700 space-y-3">
            <p>
              Les produits vendus étant des <span className="font-black">contenus numériques</span> (clés), les règles de retour peuvent être spécifiques
              selon votre pays. Définissez clairement les conditions et les exceptions.
            </p>
            <p>
              <span className="font-black">Cas typiques</span> : clé invalide (remplacement), erreur technique prouvée (assistance), etc.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

