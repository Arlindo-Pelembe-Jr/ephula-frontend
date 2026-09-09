# Ephula Frontend

Canal web (PWA) para agricultores e extensionistas.

## Canais da plataforma Ephula

- **SMS**: agricultores sem internet (API: `POST /api/v1/sms/inbound`)
- **USSD**: agricultores via menu `*123#` (API: `POST /api/v1/ussd/callback`)
- **Web/PWA**: este frontend (agricultores e extensionistas com smartphone)

## Desenvolvimento

```
cd ephula-frontend
npm install
npm run dev
```

Abre em `http://localhost:5173`.

Requer: API a correr em `localhost:8000`.

## Páginas

| Rota | Descrição |
|---|---|
| `/` | Dashboard (extensionistas) |
| `/register` | Registo de agricultor (canal web) |
| `/programs/:id` | Detalhe do programa |
| `/clima` | Estado climático por machamba |
