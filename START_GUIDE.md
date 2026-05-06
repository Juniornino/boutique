# Guide de Démarrage — Place de Marché de Clés de Licences

Ce guide vous accompagne étape par étape pour configurer, installer et lancer l'application (Backend + Frontend).

## 1. Prérequis

Assurez-vous d'avoir installé les outils suivants sur votre machine :
- **Node.js** (v18 ou supérieur)
- **PostgreSQL** (en cours d'exécution)
- **MongoDB** (Atlas ou instance locale)
- **Redis** (en cours d'exécution sur le port 6379)

## 2. Configuration du Backend

1. Ouvrez un terminal et placez-vous dans le dossier `backend` :
   ```bash
   cd backend
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Configuration des variables d'environnement :
   Copiez le fichier `.env.example` vers un nouveau fichier `.env` :
   ```bash
   cp .env.example .env
   ```
   Remplissez ensuite les valeurs dans `.env` :
   - `DATABASE_URL` (URL de votre base PostgreSQL)
   - `MONGODB_URI` (URL de votre cluster MongoDB)
   - `REDIS_HOST` et `REDIS_PORT` (si différents des valeurs par défaut)
   - Clés secrètes JWT et API Chariot Checkout

4. Génération et Migration de Prisma (PostgreSQL) :
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Lancement du Backend :
   Pour le développement (avec rechargement automatique) :
   ```bash
   npm run dev
   ```
   Le serveur backend sera accessible sur `http://localhost:5000`.

## 3. Configuration du Frontend

1. Ouvrez un autre terminal et placez-vous dans le dossier `frontend` :
   ```bash
   cd frontend
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Lancement du Frontend :
   ```bash
   npm run dev
   ```
   Le frontend React sera accessible sur `http://localhost:5173`.

## 4. Notes sur l'intégration Frontend/Backend

- **Adaptation des données :** Le frontend a été adapté pour refléter fidèlement les modèles de données du backend (et non l'inverse).
  - Les catégories utilisent les énumérations backend (`OS`, `OFFICE`, `SECURITY`, `UTILITY`, `OTHER`).
  - L'identifiant des produits est désormais `_id` (format MongoDB) dans les modèles React.
  - Le statut d'activité utilise le champ `isActive` ou des statuts comme `COMPLETED`, `PENDING` stricts.
- **Cache & Redis :** Pensez à bien laisser Redis tourner en arrière-plan, sinon le panier et le catalogue du backend renverront des erreurs.

## 5. Mise en Production

Pour le déploiement en production du backend, utilisez PM2 :
```bash
npm install -g pm2
pm2 start ecosystem.config.js
```
Cela lancera l'API en mode cluster pour maximiser les performances.
