# Guide de Démarrage — Backend Place de marché

Ce guide vous accompagne étape par étape pour démarrer le backend de la place de marché de clés de licences numériques.

## Prérequis

Assurez-vous d'avoir installé les outils suivants sur votre machine :
- [Node.js](https://nodejs.org/) (version 18+ recommandée)
- [PostgreSQL](https://www.postgresql.org/)
- [MongoDB](https://www.mongodb.com/) (ou un cluster MongoDB Atlas)
- [Redis](https://redis.io/)

## Étape 1 : Installation des dépendances

Ouvrez un terminal, placez-vous dans le dossier `backend` et exécutez :

```bash
cd backend
npm install
```

## Étape 2 : Configuration de l'environnement

Copiez le fichier `.env.example` en `.env` :

```bash
cp .env.example .env
```

Ouvrez le fichier `.env` et configurez les variables, notamment :
- `DATABASE_URL` : L'URL de connexion à votre base PostgreSQL.
- `MONGODB_URI` : L'URL de connexion à votre base MongoDB.
- `REDIS_HOST` et `REDIS_PORT` : Configuration de votre serveur Redis.
- `JWT_SECRET` et `JWT_REFRESH_SECRET` : Des chaînes secrètes fortes.
- `CHARIOT_API_KEY`, `CHARIOT_API_SECRET`, etc. : Vos identifiants Chariot Checkout.

## Étape 3 : Initialisation de la base de données PostgreSQL

Le backend utilise Prisma pour interagir avec PostgreSQL. Générez le client Prisma et appliquez le schéma à la base de données :

```bash
npx prisma generate
npx prisma db push
```

## Étape 4 : Démarrage des serveurs (Bases de données)

Assurez-vous que vos services MongoDB, PostgreSQL et Redis sont bien en cours d'exécution.
- Si vous utilisez Docker pour Redis et Postgres, démarrez vos conteneurs.
- Vérifiez que les ports correspondants (5432 pour PG, 6379 pour Redis, 27017 pour Mongo) sont accessibles.

## Étape 5 : Lancement de l'application en mode développement

Pour lancer le serveur avec rechargement automatique (via nodemon) :

```bash
npm run dev
```

Le serveur devrait démarrer et afficher dans la console :
```
MongoDB connecté avec succès
Redis connecté avec succès
Server running in development mode on port 5000
```

## Étape 6 : Test de santé

Pour vérifier que le backend fonctionne correctement, vous pouvez faire une requête sur l'endpoint de santé :

```bash
curl http://localhost:5000/health
```

Vous devriez obtenir une réponse JSON de type :
```json
{
  "status": "ok",
  "uptime": 12.34,
  "timestamp": 1714701234567
}
```

## Lancement en Production

Pour la production, il est recommandé d'utiliser PM2. Assurez-vous d'avoir PM2 installé globalement (`npm install -g pm2`), puis lancez :

```bash
pm2 start ecosystem.config.js
```

Cela démarrera l'application en mode cluster, optimisant ainsi l'utilisation de tous les cœurs du processeur disponibles.

## Notes de développement
- **Architecture Stateless** : Le backend est conçu pour scaler horizontalement. Ne stockez aucun état en mémoire (utilisez Redis).
- **Sécurité** : Toutes les entrées sont validées via Joi, et les attaques NoSQL / bruteforce sont mitigées.
- **Paiements** : Le webhook Chariot nécessite le *raw body* pour vérifier la signature HMAC-SHA256. Testez vos webhooks avec les outils fournis par Chariot.

Bon développement !