# LS Manager GUI

## Avvio locale

Richiede Node.js 20 o successivo.

```sh
cp .env.example .env.local
npm ci
npm run dev
```

Se `VITE_BACKEND_URL` è vuoto, Vite inoltra le richieste `/api` a
`http://localhost:8084`. In un deployment separato impostare invece l'origine
pubblica del backend, senza `/api` finale.

## Verifica

```sh
npm run lint
npm run build
```

I due controlli possono essere eseguiti insieme con `npm run check`.
