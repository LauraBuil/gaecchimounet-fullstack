# GAEC Chimounet — état des lieux et finalisation

Diagnostic initial du 9 septembre 2026. La CI/CD sera traitée en dernier.

## Périmètre existant

- Frontend React 19, TypeScript, Vite et SCSS dans `gaec-chimounet-frontend/`.
- Pages publiques : accueil, produits, galerie, recettes et détail, contact, mentions légales.
- Commandes redirigées vers Kuupanda ; contact par e-mail et téléphone.
- Administration : recettes et leurs ingrédients/étapes, produits, galerie, points de distribution et utilisateurs.
- Authentification Supabase, rôles administrateur/exploitant, récupération et changement de mot de passe.
- Migrations Supabase : schéma, politiques d'accès, stockage des images,
  durcissement et droits explicites du Data API.
- Fonction serveur `manage-users` pour inviter et supprimer les comptes.
- Données initiales JSON et script d'import sécurisé pour les produits et la galerie.
- Ancien backend Laravel absent du disque, encore présent dans l'index Git comme fichiers ajoutés puis supprimés.

## Vérification effectuée

`npm run build` réussit : vérification TypeScript et production du site statique.
Les routes sont chargées à la demande et le fichier principal pèse environ
13 ko avant compression.

La connexion distante, les migrations, les permissions, les médias et les
principaux parcours navigateur ont également été vérifiés. Les e-mails réels
d'invitation et de récupération restent à tester.

## Travaux prioritaires

1. **Rendre le dépôt reproductible.** Terminé : le frontend est suivi comme des fichiers ordinaires, les métadonnées d'IDE sont ignorées et l'ancien squelette Laravel absent a été retiré de l'index.
2. **Valider l'installation Supabase.** Terminé :
   migrations appliquées, RLS actif sur les 7 tables, droits du Data API
   explicites, aucun avertissement de sécurité et fonction `manage-users`
   déployée. Le premier administrateur est créé. Les 4 produits, les 12 photos
   et leurs fichiers ont été importés. La lecture publique des contenus et des
   médias fonctionne, tandis que les écritures anonymes sont refusées.
3. **Fiabiliser les sauvegardes.** Terminé : une fonction SQL enregistre désormais la recette, ses ingrédients et ses étapes dans une seule transaction.
4. **Fiabiliser les comptes.** Terminé pour les défauts identifiés : validation des données reçues, suppression par cascade et protection testée du dernier administrateur. Une inscription publique accidentelle ne crée aucun profil autorisé.
5. **Vérifier les transitions de session.** Les réponses de profil obsolètes sont désormais ignorées après déconnexion ou changement de compte. La connexion administrateur et les permissions ont été validées sur l'instance distante ; les e-mails réels de récupération et d'invitation restent à contrôler.
6. **Terminer les parcours publics.** Page introuvable ajoutée et brouillons exclus du détail public. Les routes principales ont été contrôlées dans un navigateur sur ordinateur et mobile.
7. **Finaliser contenu et présentation.** Langue, description, politique de confidentialité, rendu ordinateur/mobile et états vides principaux sont traités. Compléter les mentions légales avec l'identité de l'hébergeur retenu et faire relire les textes définitifs par le propriétaire.
8. **Préparer le déploiement manuel.** Les variables et secrets sont documentés. Il reste à choisir l'hébergement et le domaine, ajouter le renvoi des routes vers `index.html`, puis configurer les redirections d'authentification et `SITE_URL` avec l'adresse publique. Tester ensuite les parcours visiteur/exploitant/administrateur sur le site déployé.
9. **CI/CD en dernier**, après validation fonctionnelle et choix de l'hébergement.

## Informations à confirmer

- Hébergement et domaine envisagés.
- Textes et photos définitifs, notamment les recettes.
- Identité de l'hébergeur à ajouter aux mentions légales.
- Éventuelles fonctionnalités attendues qui ne figurent pas dans le code actuel.

## Situation au 9 septembre 2026

- Contenu distant : 4 produits, 12 photos, 1 point de distribution et aucune recette.
- Le bouton Administration, le tableau de bord et la gestion des horaires et
  points de distribution sont opérationnels.
- Les branches `main` et `staging` disposent d'un historique Git propre.

Le périmètre de départ est le site vitrine administrable existant, avec commande via Kuupanda. Aucun développement de paiement ou de boutique interne n'est supposé.
