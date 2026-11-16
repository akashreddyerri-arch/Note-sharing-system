# Notehaven

Notehaven is a responsive student community for sharing study notes. The repository is organized into separate frontend and backend workspaces.

## Project structure

```text
FSD/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/       # Student sign-in and reusable UI
│   │   ├── services/         # Auth and notes API clients
│   │   ├── App.jsx
│   │   └── ...
│   ├── index.html
│   └── package.json
├── backend/                  # Express + MongoDB API
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── routes/
│   ├── uploads/              # Local note attachments (ignored by Git)
│   └── package.json
└── package.json              # Workspace commands
```

## Requirements

- Node.js 20.19+ (or 22.12+)
- MongoDB 7+ running locally, or a MongoDB connection string

## Run locally

From the `FSD` directory:

```powershell
npm install
Copy-Item backend\.env.example backend\.env
npm run dev
```

The frontend runs at <http://127.0.0.1:5173> and the API at <http://127.0.0.1:5000>. The API defaults to `mongodb://127.0.0.1:27017/notehaven`. Edit `backend\.env` for a different connection string and set `JWT_SECRET` to a long random value. The `.env` file and uploaded files are excluded from source control.

`npm run dev` starts both apps. Stop both with **Ctrl+C** in that terminal.

## Student accounts

Students can create an account with their name, email, and a password of at least 10 characters. Passwords are hashed before storage; the API issues an HTTP-only session cookie and rate-limits sign-in and registration attempts. Notes can be shared with the community or with one of a student's study groups. Members can read group notes, while only the author can edit, hide, or delete their own notes.

Create a study group from the sidebar, then share its 16-character invite code with classmates. They can sign in, choose **Join with code**, and enter it to access the group's notes.

## Features

- Distinctive, responsive sign-in and notes-library screens
- Create study groups and invite classmates with a shareable code
- Share notes with the community or a specific group
- Group notes and invite codes are available only to group members
- Search notes and filter by subject
- Upload PDF, Word, PowerPoint, PNG, JPG, and WebP files (up to 20 MB)
- Create, edit, hide, download, and delete notes
- MongoDB persistence and randomized upload filenames

## Production checks

```powershell
npm run lint
npm run build
```

The production client files are generated in `frontend\dist`. Start the API separately with `npm start` after setting its environment variables.

## API

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create a student account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/auth/me` | Get the signed-in student |
| `POST` | `/api/auth/logout` | Sign out |
| `GET` | `/api/groups` | List your study groups |
| `POST` | `/api/groups` | Create a study group |
| `POST` | `/api/groups/join` | Join a group with an invite code |
| `GET` | `/api/groups/:id` | Get a group you belong to |
| `GET` | `/api/health` | API and database health |
| `GET` | `/api/notes` | List visible notes |
| `GET` | `/api/notes/:id` | Get a note |
| `GET` | `/api/notes/:id/download` | Download a visible note attachment |
| `POST` | `/api/notes` | Create a note (`multipart/form-data`, file field: `file`) |
| `PUT` | `/api/notes/:id` | Update a note and optionally replace its file |
| `PATCH` | `/api/notes/:id/status` | Set status to `active` or `inactive` |
| `DELETE` | `/api/notes/:id` | Delete your note and its uploaded file |
