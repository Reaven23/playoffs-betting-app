# NBA Playoffs Betting App

Une application web pour parier sur les matchs des playoffs NBA. Les utilisateurs peuvent créer des comptes, parier sur les matchs et gagner des points en fonction de leurs prédictions.

## Fonctionnalités

- 🏀 Création de séries et matchs (admin)
- 💰 Système de paris avec points
- 🏆 Tableau des scores
- 👤 Gestion des utilisateurs et rôles
- 📱 Interface responsive

## Technologies

- Frontend : React + Vite
- Backend : Node.js + Express
- Base de données : SQLite
- ORM : Sequelize

## Installation

1. Backend :
```bash
cd backend
npm install
npm start
```

2. Frontend :
```bash
cd frontend
npm install
npm run dev
```

## Configuration

1. Créer un fichier `.env` dans le dossier backend :
```
JWT_SECRET=votre_secret
PORT=3001
```

2. Initialiser la base de données :
```bash
cd backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

## Fonctionnement

- Les utilisateurs normaux peuvent :
  - Voir les matchs en cours
  - Placer des paris
  - Consulter leurs paris
  - Voir le classement

- Les administrateurs peuvent :
  - Créer des séries
  - Ajouter des matchs
  - Définir les gagnants
  - Gérer les utilisateurs
