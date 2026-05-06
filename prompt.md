# PROMPT — Backend Place de marché de clés de licences numériques
# Version : 2.0 — Optimisation + Sécurité incluses

## CONTEXTE  
J'ai déjà un frontend React.js (Vite) + Tailwind CSS entièrement codé avec des données fictives que tu vas adapter au backend.
Je n'ai besoin QUE du backend. Ne génère aucun code frontend, aucun design, aucune page React.

---

## STACK BACKEND CIBLE

- **Runtime** : Node.js + Express
- **Panier** : Redis (ioredis) — seul gestionnaire du panier et des sessions temporaires
- **Paiements & Commandes** : API Chariot Checkout + PostgreSQL (via Prisma)
- **Toutes les autres données** : MongoDB Atlas (via Mongoose) — Users, Products, Categories, etc.
- **Authentification** : JWT (jsonwebtoken) + bcryptjs
- **Pas de synchronisation PG ↔ MongoDB** : les données sont jointes côté applicatif uniquement (jointure manuelle dans le service)

---

## ARCHITECTURE DES BASES DE DONNÉES

### Redis — Panier uniquement
- Clé : `cart:{userId}` → JSON array des articles
- TTL : 24h (configurable via env `CART_TTL_SECONDS`)
- Opérations : getCart, addToCart, removeFromCart, updateCartItem, clearCart, getCartTotal
- Le panier est vidé automatiquement après un paiement confirmé par Chariot
- **Optimisation** : les clés disponibles par produit sont aussi stockées dans Redis sous `available_keys:{productId}` (liste LPUSH/RPOP) pour un pop atomique O(1) à l'achat — PostgreSQL est mis à jour en arrière-plan

### PostgreSQL (Prisma) — Données transactionnelles critiques

Schéma Prisma à générer :

```prisma
model UserRef {
  id        String   @id   // = _id MongoDB
  email     String   @unique
  orders    Order[]
}

model ProductRef {
  id          String       @id   // = _id MongoDB
  name        String
  price       Decimal      @db.Decimal(10,2)
  licenseKeys LicenseKey[]
  orders      Order[]
}

model LicenseKey {
  id        String        @id @default(uuid())
  code      String        @unique
  status    LicenseStatus @default(AVAILABLE)
  productId String
  orderId   String?       @unique
  product   ProductRef    @relation(fields: [productId], references: [id])
  order     Order?        @relation(fields: [orderId], references: [id])
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  @@index([productId, status])
}

model Order {
  id                String      @id @default(uuid())
  userId            String
  productId         String
  totalAmount       Decimal     @db.Decimal(10,2)
  status            OrderStatus @default(PENDING)
  chariotCheckoutId String?     @unique
  chariotPaymentId  String?
  user              UserRef     @relation(fields: [userId], references: [id])
  product           ProductRef  @relation(fields: [productId], references: [id])
  licenseKey        LicenseKey?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  @@index([userId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
  @@index([status, createdAt(sort: Desc)])
  @@index([userId, createdAt(sort: Desc)])
}

enum LicenseStatus { AVAILABLE SOLD RESERVED }
enum OrderStatus   { PENDING PROCESSING COMPLETED FAILED REFUNDED }
```

### MongoDB Atlas (Mongoose) — Toutes les autres données
- **User** : email, password (hashé), role (USER/ADMIN), firstName, lastName, isActive, lastLogin
- **Product** : name, description, price, category (OS/OFFICE/SECURITY/UTILITY/OTHER), image, publisher, version, isActive, availableKeysCount, soldCount, tags[]
- Index MongoDB obligatoires : `{ category: 1, isActive: 1 }`, `{ price: 1 }`, `{ name: 'text', description: 'text' }`

---

## JOINTURE APPLICATIVE (pas de sync)

Pour afficher les commandes d'un utilisateur, faire deux requêtes séparées et assembler côté serveur :

```js
// orderController.js — GET /api/orders/my
const getMyOrders = async (req, res) => {
  const userId = req.user.id;

  // 1. Commandes + clés → PostgreSQL (paginé)
  const page  = parseInt(req.query.page)  || 0;
  const limit = parseInt(req.query.limit) || 20;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: { licenseKey: { select: { code: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: page * limit,
  });

  // 2. Détails produits → MongoDB (un seul appel groupé)
  const productIds = [...new Set(orders.map(o => o.productId))];
  const products   = await Product.find({ _id: { $in: productIds } })
    .select('name image category price');

  // 3. Assemblage côté serveur
  const productMap = Object.fromEntries(
    products.map(p => [p._id.toString(), p])
  );

  const result = orders.map(order => ({
    ...order,
    product: productMap[order.productId] ?? null,
  }));

  res.json({ success: true, data: result });
};
```

---

## INTÉGRATION CHARIOT CHECKOUT

### Flux de paiement
1. `POST /api/checkout/session` → créer une session Chariot, pop la clé depuis Redis (`RPOP available_keys:{productId}`), retourner `checkoutUrl`
2. `POST /api/checkout/webhook` → webhook Chariot (vérification signature HMAC-SHA256) → si `payment.completed` : transaction atomique PostgreSQL (clé SOLD + Order COMPLETED)
3. `GET /api/checkout/session/:id` → vérifier le statut d'une session

### Service Chariot à créer (`src/services/chariotService.js`)
```js
// Fonctions à implémenter :
createCheckoutSession({ orderId, amount, currency, items, customerEmail, successUrl, cancelUrl })
verifyWebhookSignature(payload, signature, secret)   // HMAC-SHA256
getPaymentStatus(checkoutId)
refundPayment(paymentId, amount)
```

### Variables d'environnement Chariot
```
CHARIOT_API_KEY=
CHARIOT_API_SECRET=
CHARIOT_BASE_URL=https://api.givechariot.com/v1
CHARIOT_WEBHOOK_SECRET=
```

---

## LOGIQUE DE TRANSACTION (règle d'or)

Lors de la confirmation de paiement par Chariot webhook, exécuter en **une seule transaction Prisma atomique** :

```js
await prisma.$transaction(async (tx) => {
  // 1. Pop atomique depuis Redis (déjà réservé au checkout)
  //    Si Redis vide en cas de crash, fallback sur PostgreSQL
  const key = await tx.licenseKey.findFirst({
    where: { productId, status: { in: ['AVAILABLE', 'RESERVED'] }, orderId: null },
    orderBy: { createdAt: 'asc' },
  });
  if (!key) throw new Error('Aucune clé disponible');

  // 2. Marquer la clé SOLD et lier à la commande
  await tx.licenseKey.update({
    where: { id: key.id },
    data:  { status: 'SOLD', orderId },
  });

  // 3. Mettre à jour la commande COMPLETED
  await tx.order.update({
    where: { id: orderId },
    data:  { status: 'COMPLETED', chariotPaymentId },
  });
});
```

---

## OPTIMISATION — PERFORMANCE & SCALABILITÉ

### 1. Pagination stricte sur toutes les routes de liste
Toutes les routes qui retournent des listes doivent accepter `?page=0&limit=20` et ne jamais retourner plus de 100 éléments par appel. Appliquer sur : `/api/products`, `/api/orders/my`, `/api/admin/orders`, `/api/admin/products/:id/keys`.

```js
// Helper réutilisable à créer dans src/utils/paginate.js
const paginate = (query) => {
  const page  = Math.max(0, parseInt(query.page)  || 0);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  return { take: limit, skip: page * limit, page, limit };
};
```

### 2. Cache Redis sur le catalogue produits
```js
// src/services/productService.js
const getProducts = async (filters) => {
  const cacheKey = `products:${JSON.stringify(filters)}`;
  const cached   = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const products = await Product.find(buildMongoQuery(filters))
    .limit(filters.limit || 20)
    .skip(filters.skip  || 0);

  await redis.set(cacheKey, JSON.stringify(products), 'EX', 300); // 5 min
  return products;
};

// Invalider le cache à chaque création/modification de produit
const invalidateProductCache = async () => {
  const keys = await redis.keys('products:*');
  if (keys.length) await redis.del(...keys);
};
```

### 3. File Redis pour les clés disponibles (O(1) à l'achat)
```js
// À l'import bulk de clés → pousser dans Redis
await redis.lpush(`available_keys:${productId}`, ...keyCodes);

// À l'achat → pop atomique, sans requête PostgreSQL dans le chemin critique
const keyCode = await redis.rpop(`available_keys:${productId}`);
if (!keyCode) throw new Error('Rupture de stock');

// PostgreSQL mis à jour en arrière-plan (non bloquant)
setImmediate(() =>
  prisma.licenseKey.update({
    where: { code: keyCode },
    data:  { status: 'SOLD', orderId },
  })
);
```

### 4. Requêtes sans N+1
Ne jamais faire de requête dans une boucle. Toujours utiliser `$in` (MongoDB) ou `include` (Prisma) pour les relations. Créer un lint rule ou commentaire d'avertissement dans le code si une boucle async est détectée sur des requêtes DB.

### 5. Préparation Horizontal Scaling
- Le serveur doit être **stateless** : aucun état en mémoire locale (pas de Map, pas de variable globale pour stocker des sessions)
- Toute session/état partagé passe par Redis
- Créer `ecosystem.config.js` pour PM2 avec `instances: 'max'` et `exec_mode: 'cluster'`
- Ajouter un endpoint `GET /health` qui retourne `{ status: 'ok', uptime, timestamp }` pour le load balancer

```js
// ecosystem.config.js
module.exports = {
  apps: [{
    name:      'licensekeys-api',
    script:    'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: { NODE_ENV: 'production' },
  }]
};
```

---

## SÉCURITÉ — RÈGLES OBLIGATOIRES

### 1. Helmet — Headers HTTP sécurisés
```js
// src/server.js
const helmet = require('helmet');
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc:  ["'self'"],
    objectSrc:  ["'none'"],
    upgradeInsecureRequests: [],
  },
}));
```

### 2. Rate Limiting — Anti brute-force et anti-spam
```js
const rateLimit = require('express-rate-limit');

// Limite globale
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Limite stricte sur l'auth
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Trop de tentatives, réessayez dans 15 minutes.' },
}));

// Limite sur le checkout (anti-abus)
app.use('/api/checkout', rateLimit({ windowMs: 60 * 1000, max: 5 }));
```

### 3. Validation stricte des entrées — Joi sur toutes les routes
Créer des schémas Joi pour chaque route qui accepte un body. Ne jamais faire confiance aux données du client. Exemples obligatoires :

```js
// src/validators/authValidator.js
const Joi = require('joi');

const registerSchema = Joi.object({
  email:     Joi.string().email().max(255).required(),
  password:  Joi.string().min(8).max(128).pattern(/^(?=.*[A-Z])(?=.*[0-9])/).required(),
  firstName: Joi.string().trim().max(100).optional(),
  lastName:  Joi.string().trim().max(100).optional(),
});

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

// src/validators/productValidator.js
const bulkKeysSchema = Joi.object({
  keys: Joi.string().max(500000).required(), // texte multiligne
});
```

### 4. Injection NoSQL — Protection MongoDB
```js
// Middleware à appliquer avant toutes les routes
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize()); // bloque les clés avec $ ou .
```
Ajouter `express-mongo-sanitize` aux dépendances.

### 5. JWT — Bonnes pratiques
- Stocker le JWT côté client dans un cookie `httpOnly; Secure; SameSite=Strict` (pas dans localStorage)
- Expiration courte : `15min` pour l'access token, `7d` pour le refresh token
- Ne jamais mettre d'informations sensibles dans le payload JWT (pas de mot de passe, pas de carte bancaire)
- Payload minimal : `{ id, email, role, iat, exp }`

```js
// src/config/jwt.js
const generateTokens = (user) => {
  const payload = { id: user._id.toString(), email: user.email, role: user.role };
  const accessToken  = jwt.sign(payload, process.env.JWT_SECRET,         { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};
```

### 6. Mot de passe — Règles bcrypt
- Minimum 12 rounds de bcrypt en production
- Vérifier la force du mot de passe côté serveur (1 majuscule, 1 chiffre, 8 caractères minimum)
- Ne jamais logger un mot de passe, même hashé

### 7. Webhook Chariot — Vérification signature obligatoire
```js
// src/services/chariotService.js
const verifyWebhookSignature = (rawBody, signature, secret) => {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  // Comparaison en temps constant (anti timing attack)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
};

// src/routes/checkoutRoutes.js
// Le webhook doit recevoir le raw body (pas parsé par express.json)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }), // raw body obligatoire
  checkoutController.handleWebhook
);
```

### 8. Exposition des données — Règles strictes
- Le champ `licenseKey.code` n'est **jamais** retourné dans une liste
- Il est uniquement accessible via `GET /api/orders/my` pour le propriétaire authentifié
- Les routes admin vérifient `role === 'ADMIN'` via middleware `requireAdmin` avant tout accès
- Ne jamais retourner le champ `password` depuis MongoDB (utiliser `.select('-password')` systématiquement)
- Les erreurs de production ne retournent **jamais** les stack traces : logger côté serveur, message générique côté client

```js
// src/middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  logger.error({ message: err.message, stack: err.stack, path: req.path });
  const status  = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Une erreur est survenue.'
    : err.message;
  res.status(status).json({ success: false, message });
};
```

### 9. CORS — Configuration stricte
```js
app.use(cors({
  origin:      process.env.FRONTEND_URL, // jamais '*' en production
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 10. Protection contre la pollution des paramètres
```js
const hpp = require('hpp');
app.use(hpp()); // bloque les paramètres query dupliqués (?status=A&status=B)
```
Ajouter `hpp` aux dépendances.

### 11. Logs de sécurité — Traçabilité
Logger avec Winston les événements suivants (sans données sensibles) :
- Tentatives de connexion échouées (email + IP + timestamp)
- Accès refusé (401/403) avec IP et route
- Webhook Chariot reçu (id, statut, timestamp)
- Import bulk de clés (productId, nombre de clés, adminId)
- Transaction d'achat (orderId, userId, productId — jamais le code de clé en clair)

---

## STRUCTURE DES DOSSIERS

```
/backend
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   ├── database.js          # connexion MongoDB
│   │   ├── prisma.js            # client Prisma singleton
│   │   ├── redis.js             # client Redis + helpers panier + file clés
│   │   └── logger.js            # Winston
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── checkoutController.js
│   │   └── adminController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js    # verifyToken, requireAdmin
│   │   ├── validate.js          # middleware Joi générique
│   │   └── errorHandler.js      # erreurs centralisées, pas de stack en prod
│   ├── models/
│   │   └── mongo/
│   │       ├── User.js
│   │       └── Product.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── checkoutRoutes.js
│   │   └── adminRoutes.js
│   ├── services/
│   │   ├── chariotService.js    # intégration API Chariot + vérif HMAC
│   │   └── licenseService.js    # logique clés (import bulk, file Redis, attribution)
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── productValidator.js
│   │   └── orderValidator.js
│   ├── utils/
│   │   └── paginate.js          # helper pagination réutilisable
│   └── server.js
├── ecosystem.config.js           # PM2 cluster
├── .env.example
└── package.json
```

---

## ROUTES API À IMPLÉMENTER

### Auth (`/api/auth`)
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/register` | Crée user dans MongoDB + UserRef dans PG — valider avec Joi |
| POST | `/login` | Vérifie password (MongoDB), retourne access + refresh token en cookie httpOnly |
| POST | `/refresh` | Renouvelle l'access token via le refresh token |
| GET | `/me` | Profil utilisateur connecté (sans password) |
| POST | `/logout` | Clear les cookies côté serveur |

### Panier (`/api/cart`) — Redis
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Lire le panier Redis de l'utilisateur |
| POST | `/` | Ajouter un article — valider productId + quantity |
| PUT | `/:productId` | Modifier la quantité |
| DELETE | `/:productId` | Retirer un article |
| DELETE | `/` | Vider le panier |

### Produits (`/api/products`) — MongoDB + cache Redis
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Liste paginée avec filtres (category, search, page, limit) — cache Redis 5min |
| GET | `/:id` | Détail produit |

### Commandes (`/api/orders`) — PostgreSQL + jointure MongoDB
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/my` | Mes achats paginés avec licenseKey.code et détail produit (jointure applicative) |
| GET | `/:id` | Détail commande — vérifier que userId correspond |

### Checkout (`/api/checkout`) — Chariot
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/session` | Créer session Chariot depuis le panier Redis |
| POST | `/webhook` | Webhook Chariot — raw body obligatoire, vérif signature HMAC |
| GET | `/session/:id` | Statut d'une session |

### Admin (`/api/admin`) — requireAdmin middleware obligatoire sur toutes les routes
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/products` | Créer produit (MongoDB + ProductRef PG) + invalider cache Redis |
| PUT | `/products/:id` | Modifier produit + invalider cache Redis |
| DELETE | `/products/:id` | Désactiver produit (soft delete) |
| POST | `/products/:id/keys` | Import bulk de clés — une par ligne, batch PG + LPUSH Redis |
| GET | `/products/:id/keys` | Lister clés avec statuts — paginé, jamais le code en clair sauf AVAILABLE |
| GET | `/orders` | Toutes les commandes paginées avec filtres (status, date) |

### Health (`/health`) — Sans auth, pour load balancer
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | `{ status: 'ok', uptime, timestamp }` |

---

## DÉPENDANCES À INSTALLER

```json
{
  "dependencies": {
    "@prisma/client": "^5.10.0",
    "axios": "^1.6.7",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.4",
    "express": "^4.18.2",
    "express-mongo-sanitize": "^2.2.0",
    "express-rate-limit": "^7.2.0",
    "helmet": "^7.1.0",
    "hpp": "^0.2.3",
    "ioredis": "^5.3.2",
    "joi": "^17.12.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.2.1",
    "morgan": "^1.10.0",
    "uuid": "^9.0.1",
    "winston": "^3.12.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0",
    "prisma": "^5.10.0"
  }
}
```

---

## VARIABLES D'ENVIRONNEMENT REQUISES (.env.example)

```env
PORT=5000
NODE_ENV=development

JWT_SECRET=change_me_in_production_min_32_chars
JWT_REFRESH_SECRET=another_secret_for_refresh_tokens
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

DATABASE_URL="postgresql://user:password@localhost:5432/licensekeys_db?schema=public"
MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/licensekeys"

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CART_TTL_SECONDS=86400

CHARIOT_API_KEY=
CHARIOT_API_SECRET=
CHARIOT_BASE_URL=https://api.givechariot.com/v1
CHARIOT_WEBHOOK_SECRET=

FRONTEND_URL=http://localhost:5173
BCRYPT_ROUNDS=12
```

---

## RÈGLES DE GÉNÉRATION — RÉSUMÉ

1. Génère **uniquement le backend a adapter avec le frontend** — aucun fichier frontend, aucun composant React 
2. Toutes les réponses API suivent le format `{ success: true/false, data: {}, message: "" }`
3. **Pagination obligatoire** sur toutes les routes de liste — jamais de fetch sans `take/limit`
4. **Cache Redis** sur le catalogue produits — invalider à chaque modification
5. **File Redis** pour les clés disponibles — LPUSH à l'import, RPOP à l'achat
6. Le serveur est **stateless** — aucun état en mémoire locale
7. Le webhook Chariot reçoit le **raw body** pour la vérification HMAC
8. La transaction atomique Prisma est **non négociable** pour l'attribution des clés
9. Ne jamais retourner `licenseKey.code` dans une liste — uniquement dans `GET /orders/my` pour le propriétaire
10. Ne jamais retourner les stack traces en production
11. **Valider toutes les entrées** avec Joi avant d'atteindre le controller
12. **Sanitizer MongoDB** avec `express-mongo-sanitize` sur toutes les routes
13. Utiliser **Winston** pour les logs — jamais `console.log` en production
14. `ecosystem.config.js` PM2 cluster obligatoire pour le scaling horizontal
15. Endpoint `GET /health` sans auth pour le load balancer
16. lier le backend au frontend avec les meme données venant du backend
17. Comment le code pour qu'il soit comprehensible
18.Ecrire le fichier de guide de demarrage de l'application etape par etape  au format markdown
```
