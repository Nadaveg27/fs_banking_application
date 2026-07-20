<div align="center">

# 🏦 Maccabim Bank

### A Full-Stack Web Banking Platform

**[Live Demo](https://fs-banking-application.vercel.app)**

</div>

## 📋 Table of Contents

1. 🤖 [Introduction](#-introduction)
2. ⚙️ [Tech Stack](#%EF%B8%8F-tech-stack)
3. 🔋 [Features](#-features)
4. 🤸 [Quick Start](#-quick-start)
5. 🔗 [Links](#-links)

## 🤖 Introduction

Maccabim Bank is a full-stack banking platform built with React, Node.js/Express, and MongoDB. Users register and verify their account via an emailed link, log in with a JWT session stored in an HttpOnly cookie, view their balance and transaction history, transfer money to other users with real-time notifications, and chat with an AI banking assistant that reads their live account data and can execute transfers through conversation.

Deployed on Vercel (frontend) and Render (backend), with MongoDB Atlas as the database.

> ⏱️ The backend runs on Render's free tier, which spins down after inactivity — the first request may take up to ~50 seconds while the service wakes up.

## ⚙️ Tech Stack

- React + TypeScript (Vite)
- Material UI
- Node.js + Express
- MongoDB Atlas (Mongoose)
- JWT (HttpOnly cookie) + bcrypt
- Socket.IO
- Gmail API (OAuth2)
- LangGraph + LangChain (Groq)
- Vercel + Render

## 🔋 Features

👉 **Email Verification Sign-Up**: Register with email, password, and phone. A signed, short-lived verification link is sent via the Gmail API — one click activates the account and logs the user in.

👉 **Secure Authentication**: JWT delivered as an HttpOnly cookie (immune to XSS token theft). The token carries only the `userId` — all user data is fetched fresh from the database per request.

👉 **Dashboard**: Balance and paginated transaction history, seeded with a random starting balance. Outgoing amounts show `−`, incoming `+`.

👉 **Money Transfers**: Send money to any registered user by email with an optional reason. Server-side enforcement of balance, recipient existence, and self-transfer blocking.

👉 **Real-Time Notifications**: Socket.IO pushes an instant in-app notification to the recipient of a transfer — navbar bell with unread badge and dismissal controls.

👉 **Counterparty Filter**: View the complete transaction history with one specific user.

👉 **AI Banking Assistant**: A LangGraph-powered chat assistant on the dashboard that answers banking questions, explains the user's real balance and transactions via scoped server-side tools (no direct DB access), and initiates transfers with a two-step confirm/cancel flow.

## 🤸 Quick Start

> 💡 **You don't need any of this to use the app** — it's live at [fs-banking-application.vercel.app](https://fs-banking-application.vercel.app). The steps below are only for running the project locally (development, review, or contribution).

**Prerequisites**: [Git](https://git-scm.com/), [Node.js](https://nodejs.org/en) v20+

**Cloning the Repository**

```bash
git clone https://github.com/Nadaveg27/fs_banking_application.git
cd fs_banking_application
```

**Installation**

```bash
# Backend (repo root)
npm install

# Frontend
cd client && npm install
```

**Set Up Environment Variables**

Create `.env` in the project root:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=
JWT_SECRET=
FRONTEND_URL=http://localhost:5173
BASE_URL=

# Gmail API (OAuth2)
EMAIL_USER=
EMAIL_FROM=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=

# AI Assistant
GROQ_API_KEY=
```

And `client/.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

Credentials can be obtained from [MongoDB Atlas](https://www.mongodb.com/atlas), [Google Cloud Console](https://console.cloud.google.com/) (Gmail API + OAuth2), and [Groq](https://groq.com/).

**Running the Project**

```bash
# Terminal 1 — backend → http://localhost:3000
npm start

# Terminal 2 — frontend → http://localhost:5173
cd client && npm run dev
```

## 🔗 Links

- 🌐 [Live Application](https://fs-banking-application.vercel.app)
