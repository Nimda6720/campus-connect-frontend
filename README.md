<div align="center">

# 🎓 Campus Connect

**Your Campus. Your People. Your Plans.**

A student meetup platform built for RUET — drop the messy group chats. Find study groups, gaming squads, and campus events all in one place.

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-campus--connect-1db954?style=for-the-badge)](https://campus-connect-frontend-delta.vercel.app)
[![Backend Repo](https://img.shields.io/badge/⚙️%20Backend-campus--connect--backend-333?style=for-the-badge&logo=github)](https://github.com/Nimda6720/campus-connect-backend)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?style=flat-square&logo=vercel)](https://vercel.com)

</div>

---

## 📸 Preview

> A Spotify-inspired dark-themed web app for campus social life.

_Landing page showcasing upcoming events → Log in → Browse & filter meetups → Join or create your own → Chat inside events._

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Register & log in with email/password, session persisted in localStorage |
| 📅 **Create Meetups** | Post events with title, category, location, time, description, tags & a cover image |
| 🏷️ **Categories** | Study · Gaming · Sports · Food — each with its own color badge |
| 🔍 **Search & Filter** | Find meetups instantly by name or category |
| 🤝 **Join Events** | RSVP to any meetup with a single click, see attendee counts |
| 💬 **In-Event Chat** | Live chat thread embedded in each meetup card |
| 🗑️ **Manage Your Events** | Creators can delete their own events |
| 🌙 **Dark Theme UI** | Spotify-inspired dark interface with green accent (`#1db954`) |
| 📱 **Public Landing Page** | Non-logged-in users see upcoming events as a preview |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| HTTP Client | Axios |
| Styling | Inline CSS (dark theme, no external CSS library) |
| State Management | React Hooks (`useState`, `useEffect`) |
| Auth Storage | `localStorage` |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm

### 1. Clone & Install

```bash
git clone https://github.com/Nimda6720/campus-connect-frontend.git
cd campus-connect-frontend
npm install
```

### 2. Run the Dev Server

```bash
npm start
```

Opens at [http://localhost:3000](http://localhost:3000) — hot-reloads on save.

> **Note:** The app connects to the deployed backend at `https://campus-connect-backend-l3et.onrender.com`. No local backend setup needed.

### 3. Build for Production

```bash
npm run build
```

Outputs an optimized bundle to the `build/` folder.

---

## 📁 Project Structure

```
campus-connect-frontend/
├── public/
│   └── index.html            # HTML shell
└── src/
    ├── App.js                # 🧠 Core app — all views, state & API calls
    ├── App.css               # Global styles
    ├── index.js              # React entry point
    └── reportWebVitals.js
```

> All application logic lives in `App.js` — views (landing, auth, dashboard), API calls, state management, and UI rendering are co-located for simplicity.

---

## 🌐 API

The frontend communicates with the [Campus Connect Backend](https://github.com/Nimda6720/campus-connect-backend) over REST:

| Action | Endpoint |
|--------|----------|
| Register | `POST /api/register` |
| Login | `POST /api/login` |
| Get all meetups | `GET /api/meetups` |
| Create meetup | `POST /api/meetups` |
| Join meetup | `PUT /api/meetups/:id/join` |
| Delete meetup | `DELETE /api/meetups/:id` |
| Send chat message | `POST /api/meetups/:id/chat` |

---

## 🔗 Related

- **Backend**: [campus-connect-backend](https://github.com/Nimda6720/campus-connect-backend) — Express + MongoDB + Multer
- **Live App**: [campus-connect-frontend-delta.vercel.app](https://campus-connect-frontend-delta.vercel.app)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
