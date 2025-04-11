# NBA Playoffs Betting App

Application web permettant aux utilisateurs de parier sur les matchs des playoffs NBA. Les utilisateurs peuvent créer des comptes, parier sur les matchs et gagner des points en fonction de leurs prédictions. En cours de création, NON FONCTIONNEL actuellement.

## Fonctionnalités

- Création et gestion des séries et matchs (admin)
- Système de paris avec attribution de points
- Tableau des scores des utilisateurs
- Gestion des utilisateurs et des rôles
- Interface responsive

## Stack technique

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

## Rôles et permissions

Utilisateurs :
- Consultation des matchs en cours
- Placement de paris
- Suivi des paris
- Consultation du classement

Administrateurs :
- Gestion des séries
- Gestion des matchs
- Définition des gagnants
- Administration des utilisateurs
