# Roxiler Full-Stack Assignment

## Tech Stack
- Backend: Node.js + Express + SQLite
- Auth: JWT + bcrypt
- Validation: express-validator
- Frontend: React (CRA style) + axios + react-router-dom

## Project Structure
- backend
- frontend

## Setup

### Backend
1. Copy the sample env file and update values:
   - backend/.env.sample → backend/.env
2. Install dependencies and start:
   - `npm install`
   - `npm run dev`

Backend runs on http://localhost:5000 by default.

### Frontend
1. (Optional) Create frontend/.env with:
   - `REACT_APP_API_URL=http://localhost:5000`
2. Install dependencies and start:
   - `npm install`
   - `npm start`

Frontend runs on http://localhost:3000 by default.

## API Docs (Summary)

### Auth
- POST /api/auth/signup
  - Body: { name, email, password, address }
  - Role is always `user`
- POST /api/auth/login
  - Body: { email, password }
- PATCH /api/auth/password (Auth)
  - Body: { currentPassword, newPassword }

### Admin (Auth + role=admin)
- POST /api/admin/users
  - Body: { name, email, password, address, role }
- GET /api/admin/dashboard
- GET /api/admin/users
  - Query: name, email, address, role, sortBy, sortOrder
- GET /api/admin/users/:id
- GET /api/admin/stores
  - Query: name, email, address, sortBy, sortOrder
- POST /api/admin/stores
  - Body: { name, email, address, owner_id }

### User (Auth + role=user)
- GET /api/user/stores
  - Query: name, address
- POST /api/user/ratings
  - Body: { store_id, rating }
- PATCH /api/user/ratings/:storeId
  - Body: { rating }

### Owner (Auth + role=owner)
- GET /api/owner/dashboard

## Validation Rules
- Name: 20–60 chars, alphanumeric
- Email: valid format
- Password: 8–16 chars, 1 uppercase + 1 special character
- Address: max 400 chars
- Rating: integer 1–5

## Notes
- SQLite database file is backend/db.sqlite
- Use admin route to create `admin` and `owner` users before using those dashboards.
