# ArchDraft — Outil interne de cadrage technique (MVP V1)

Ce dépôt contient un MVP Next.js (App Router) pour structurer le cadrage technique d’intégrations entre systèmes.

## Objectif MVP

- Gestion des clients
- Gestion des systèmes
- Gestion des projets et statut
- Questionnaire de cadrage
- Flux de synchronisation
- Mappings de champs
- Risques / décisions / questions ouvertes
- Timeline
- Vue projet globale (overview)

## Stack

- Next.js + React + TypeScript
- Prisma + PostgreSQL
- Tailwind CSS

## Démarrage

1. Installer les dépendances
   ```bash
   npm install
   ```

2. Configurer PostgreSQL dans `.env.local`
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/archdraft"
   ```

3. Appliquer le schema Prisma
   ```bash
   npm run db:push
   ```

4. Seeder les systèmes & questions de base
   ```bash
   npm run db:seed
   ```

5. Lancer l’app
   ```bash
   npm run dev
   ```

## Endpoints REST disponibles

- `GET/POST /api/clients`
- `GET/PUT/DELETE /api/clients/[id]`
- `GET/POST /api/systems`
- `GET/PUT/DELETE /api/systems/[id]`
- `GET/POST /api/projects`
- `GET/PUT/DELETE /api/projects/[id]`
- `GET/POST /api/questions`
- `GET/POST /api/answers`
- `GET/POST /api/project-systems`
- `GET/POST /api/sync-flows`
- `GET/POST /api/field-mappings`
- `GET/POST /api/risks`
- `GET/POST /api/decisions`
- `GET/POST /api/open-questions`
- `GET/POST /api/milestones`
- `GET /api/dashboard/stats`

## Points à itérer pour V2

- Diagrammes de flux (React Flow)
- Gestion multi-utilisateurs + auth complète
- Versioning et commentaire par entrée
- Gestion des conflits de mappings
