<div align="center">

# url_shortener

A URL shortening service with a concurrency-safe index allocator, Redis-backed sessions, and a cache-aside read path — benchmarked, load-tested, and containerized.

![TypeScript](https://img.shields.io/badge/typescript-7-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-26-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-18-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-8-DC382D?logo=redis&logoColor=white)
![Drizzle](https://img.shields.io/badge/drizzle_orm-0.45-C5F74F?logo=drizzle&logoColor=black)
![Podman](https://img.shields.io/badge/podman-containerized-892CA0?logo=podman&logoColor=white)

</div>

---

## Why it's interesting

- **Deterministic short codes, zero collisions.** Short codes aren't random strings looked up in a unique index — the 32-bit id space is pre-tiled into 10,000 contiguous ranges in a `ticket_counter` table. Each request atomically claims the next index with `UPDATE ... RETURNING` (a single round trip, race-safe under concurrent creators), then encodes the number in base-N. No collision retries, no wasted lookups.
- **Cache-aside decode path.** Decodes check Redis first (6h TTL) and fall back to Postgres, writing the result back for the next hit.
- **Measured, not vibes.** The bottleneck in this project was found by load testing, not guessing — see [Benchmarks](#benchmarks).

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | — | health check |
| `POST` | `/u/auth/signup` | — | `{ name, email, password }` → creates user + session cookie |
| `POST` | `/u/auth/login` | — | `{ email, password }` → session cookie |
| `POST` | `/u/auth/logout` | — | clears cookie, deletes the session in Redis |
| `POST` | `/u/create` | cookie | `{ url }` → `{ url: "<shortCode>" }` |
| `GET` | `/:shortCode` | — | `301` redirect to the original URL |

## Quick start (local, fully containerized)

Prereqs: [podman](https://podman.io/) (or docker), Node 22+.

<details open>
<summary>Three commands, start to finish</summary>

```bash
# 1. infra: postgres + redis on a shared network
podman network create urlnet
podman run -d --name url_postgres --network urlnet \
  -p 5432:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=url_dev_password \
  -e POSTGRES_DB=url_shortener \
  -v url_pg_data:/var/lib/postgresql \
  docker.io/library/postgres:18-alpine
podman run -d --name url_redis --network urlnet \
  -p 13839:13839 \
  docker.io/library/redis:8-alpine \
  redis-server --port 13839 --requirepass devpassword

# 2. schema + seed (creates tables and the 10k ticket-counter rows)
npm ci
npm run db:setup

# 3. run the app
podman build -t url_shortener:dev .
podman run -d --rm --replace --name url_shortener \
  --network urlnet -p 3000:3000 \
  --env-file .env \
  url_shortener:dev

# 4. try it
curl -s -X POST localhost:3000/u/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"name":"me","email":"me@example.com","password":"secret123"}' \
  -c cookies.txt
curl -s -b cookies.txt -X POST localhost:3000/u/create \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com"}'
curl -i localhost:3000/<shortCode>     # 301 → https://example.com
```

</details>

Or without containers: `npm run dev` (uses `--env-file=.env` against whatever `DB_URL`/`REDIS_HOST` point to).

> **Note:** the Redis port is currently hardcoded to `13839` in `src/redis/db.redis.ts` — that's why local Redis runs with `--port 13839`.

## Configuration

All config comes from the environment (validated with zod at startup — the app refuses to boot half-configured).

| Var | Example | Notes |
|---|---|---|
| `NODE_ENV` | `production` | switches pino to JSON/warn level; does **not** affect SSL |
| `PORT` | `3000` | |
| `DB_URL` | `postgresql://user:pass@host:5432/url_shortener` | |
| `DB_SSL` | `true` | enable TLS for the Postgres connection (e.g. Supabase). Decoupled from `NODE_ENV` on purpose |
| `REDIS_USERNAME` | `default` | |
| `REDIS_PASSWORD` | | |
| `REDIS_HOST` | `localhost` | inside a container network, use the container name |
| `ALPHABETS` | base-N alphabet for short-code encoding | |

Example env files: `.env` (cloud: Supabase + Redis Cloud, `DB_SSL=true`) and `.env.dev` (local stack).

## Benchmarks

Load-tested with [autocannon](https://github.com/nclkong/autocannon) against the running container at **`--cpus=0.125`** (deliberately starved to make the ceiling visible), 200 concurrent connections, 15s:

| Config | Throughput | p50 | p99 |
|---|---|---|---|
| dev logging (`pino-pretty` + full-request serialization) | 534 req/s | 392 ms | 1,089 ms |
| prod logging (JSON, `warn` level) | **1,023 req/s** | **102 ms** | 896 ms |

**+92% throughput** from removing the logging tax alone. Lessons that came out of the testing:

- `logger.info(req)` serialized the entire Express request object (headers, cookies, socket) on every redirect — measurable CPU plus a session-cookie leak into logs.
- The decode path's dependency on a rate-limited managed Redis instance made latency explode under sustained load (throughput *dropped* while concurrency rose — the classic saturation signature). Fixed by running Redis locally and knowing the knee before scaling.
- Errors/timeouts under load, not latency, are the real cutoff: beyond the saturation point, throughput collapses and timeouts appear.

Reproduce:

```bash
npx autocannon -c 200 -d 15 http://localhost:3000/<shortCode>
```

## Architecture

```mermaid
flowchart LR
    C[Client] --> E[Express app]
    E --> A[Auth middleware<br/>session lookup in Redis]
    E --> CU["/u/create<br/>ticket-counter allocator"]
    CU --> PG[(PostgreSQL<br/>urls · users · ticket_counter)]
    E --> D["/:shortCode<br/>cache-aside decode"]
    D --> R[(Redis<br/>sessions · url cache)]
    D --> PG
    CU --> R
    A --> R
```

## Project structure

```
src/
  auth/        # signup/login/logout, session issue/revoke
  createUrl/   # ticket-counter index allocation + base-N encoding
  decodeUrl/   # cache-aside lookup + 301 redirect
  db/          # drizzle schema, migrations (drizzle/), seed
  redis/       # session store + URL cache (redis clients)
  middleware/  # auth + error handling
  lib/         # env validation (zod), logger
```

Scripts: `npm run dev` · `npm run build` · `npm run db:generate` / `db:migrate` / `db:seed` · `db:setup` (migrate + seed)

## Known limits

- `301` responses are cached permanently by browsers — clicks after the first visit never reach the server (a `302` would allow click analytics).
- The index space is finite (~2.1B codes); `POST /u/create` permanently consumes it — don't include create endpoints in load tests.
- Redis port hardcoded to `13839` (see above).

## License

MIT
