# Esepte.me Frontend

React frontend для финансового помощника ИП Казахстана.

## Технологии

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Query

## Запуск

```bash
npm install
npm run dev
```

## Environment Variables

```env
VITE_API_URL=http://localhost:8080
```

## Build

```bash
npm run build
```

## Docker

```bash
docker build --build-arg VITE_API_URL=https://api.example.com -t esepte-frontend .
docker run -p 3000:80 esepte-frontend
```
