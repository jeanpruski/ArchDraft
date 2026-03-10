# Guide rapide PostgreSQL (ArchDraft)

Le but: donner les droits au user qui se connecte via DATABASE_URL.

1) Vérifier quel user tu utilises dans .env.local
DATABASE_URL="postgresql://UTILISATEUR:MDP@127.0.0.1:5432/archdraft"

Cas A: le connecteur n'existe pas encore en tant que user DB
1. Depuis ton terminal macOS (avec psql installé):
/opt/homebrew/opt/postgresql@16/bin/psql -h 127.0.0.1 -U postgres postgres

> Si ça refuse "postgres role does not exist", remplace -U postgres par le superuser
> disponible sur ton installation.

2. Dans le prompt psql:
```sql
CREATE USER "jeanpruski" WITH LOGIN PASSWORD 'TON_MDP';
CREATE DATABASE archdraft;
ALTER DATABASE archdraft OWNER TO "jeanpruski";
GRANT ALL PRIVILEGES ON DATABASE archdraft TO "jeanpruski";
\connect archdraft
GRANT ALL PRIVILEGES ON SCHEMA public TO "jeanpruski";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "jeanpruski";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "jeanpruski";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "jeanpruski";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "jeanpruski";
```

3. Quitter psql: `\q`
4. Dans .env.local utiliser:
DATABASE_URL="postgresql://jeanpruski:TON_MDP@127.0.0.1:5432/archdraft"
5. Relancer Next:
npm run dev

Alternative: si tu veux garder user postgres
Dans psql en tant que superuser:
```sql
ALTER USER postgres WITH PASSWORD 'TON_MDP';
CREATE DATABASE archdraft OWNER postgres;
GRANT ALL PRIVILEGES ON DATABASE archdraft TO postgres;
\connect archdraft
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

