# Installation du projet

## 1. Préparer Supabase

Le projet distant configuré par le frontend est `ebvjdhpqbhlknamosnqm`. Les
migrations et la fonction `manage-users` y ont été installées le 9 septembre
2026. Les commandes suivantes servent à reproduire ou mettre à jour cette
installation.

Depuis la racine du dépôt, connecter l'outil Supabase puis appliquer les migrations :

```powershell
npx supabase login
npx supabase link --project-ref ebvjdhpqbhlknamosnqm
npx supabase db push
```

Les migrations créent les tables, les rôles, les protections d'accès, le
stockage des images, les droits explicites du Data API et la sauvegarde atomique
des recettes.

Dans **Authentication > Providers > Email**, laisser la création publique de
comptes désactivée. Le premier compte créé depuis le tableau de bord Supabase
devient administrateur. Les comptes suivants doivent être invités depuis
l'administration du site.

Créer ce premier utilisateur dans **Authentication > Users > Add user**, avec
une adresse e-mail réelle et un mot de passe temporaire.

## 2. Déployer la gestion des utilisateurs

Configurer l'adresse du site puis déployer la fonction :

```powershell
npx supabase secrets set SITE_URL=http://localhost:5173
npx supabase functions deploy manage-users
```

Lors de la mise en ligne, remplacer l'adresse locale par le domaine public et
l'ajouter aussi aux URL autorisées dans **Authentication > URL Configuration**.

## 3. Importer les données déjà préparées

Dans un terminal PowerShell ouvert dans `gaec-chimounet-frontend` :

```powershell
npm run seed:supabase:login
```

Le script demande l'adresse e-mail et le mot de passe du compte administrateur.
Le mot de passe reste masqué, n'est pas enregistré dans un fichier et est retiré
du terminal dès que l'import se termine.

L'import peut être relancé : il met à jour les mêmes 4 produits et 12 photos
sans créer de doublons. Les recettes et les points de distribution devront être
saisis depuis l'administration, car aucune donnée fiable n'est fournie pour eux.

## 4. Lancer et contrôler le site

```powershell
cd gaec-chimounet-frontend
npm install
npm run dev
```

Contrôler les pages publiques, puis la connexion à `/admin/connexion`, la création
et la modification de chaque contenu, l'envoi d'images, l'invitation d'un
exploitant et la récupération du mot de passe.
