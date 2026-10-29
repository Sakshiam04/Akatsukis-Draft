# Akatsuki's Draft: AI-Enabled Content Sharing Platform (Backend)

Node.js + Express + MongoDB (Mongoose) + JWT + Google Gemini.

## Setup
```bash
npm install
cp .env.example .env     # fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY, ADMIN_SECRET
npm run dev
```
Get a Gemini key at https://aistudio.google.com/apikey

## Folder structure
```
server.js
config/db.js
models/        User.js, Post.js
middleware/    auth.js  (protect, adminOnly)
controllers/   authController, postController, adminController, aiController
routes/        authRoutes, postRoutes, adminRoutes, aiRoutes
```

## APIs
Send the token as `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | /auth/register | public | Register (admin: add `"role":"admin","adminSecret":"..."`) |
| POST | /auth/login | public | Login, get JWT |
| GET | /auth/me | user | Logged-in user details |
| POST | /posts | user | Create post (`status`: `draft` or `pending`) |
| GET | /posts | public | All approved posts |
| GET | /posts/my-posts | user | Own posts and drafts |
| GET | /posts/:id | public | Approved post by ID |
| PATCH | /posts/:id | owner | Update own post |
| DELETE | /posts/:id | owner | Delete own post |
| GET | /admin/posts/pending | admin | Posts awaiting approval |
| PATCH | /admin/posts/approve/:id | admin | Approve |
| PATCH | /admin/posts/reject/:id | admin | Reject |
| POST | /ai/improve/:postId | owner | AI-improve, saved as NEW draft; original kept |

## Sample requests
Register:
```json
POST /auth/register
{ "name": "Sakshi", "email": "s@example.com", "password": "123456" }
```
Create post:
```json
POST /posts
{ "title": "My first post", "description": "Intro", "content": "Hello world...", "category": "tech", "status": "pending" }
```
