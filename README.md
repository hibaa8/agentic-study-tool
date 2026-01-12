# FocusOS

A production-quality agentic study/scheduling tool scaffold.

## Structure
- **backend**: Node.js + Express + TypeScript + Prisma. Handles Google Auth, Sync, and Agent logic.
- **frontend**: React + Vite + TypeScript. UI for Dashboard and Learning.
- **shared**: Shared Zod schemas and TypeScript types.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   - Copy `backend/.env.example` to `backend/.env`
   - Fill in your Google Cloud Credentials and LLM Keys.
   - Set `TOKEN_ENCRYPTION_KEY` (32 chars).

3. **Database Setup**
   ```bash
   npm run prisma:migrate --workspace=backend
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   - Backend: [http://localhost:5001](http://localhost:5001)
   - Frontend: [http://localhost:5173](http://localhost:5173)

## Google OAuth Setup
1. Go to Google Cloud Console.
2. Create project -> Enable Gmail, Calendar, Drive APIs.
3. Create OAuth Credentials.
4. Add Redirect URI: `http://localhost:5001/auth/google/callback`.
5. Copy Client ID and Secret to `.env`.

## Features
- **Sync**: Gmail (Unread), Calendar (Next 7 days), Drive (Docs).
- **Agent**: Weekly Plan Generation (Mock/LLM), Inbox Triage.
- **Learning**: Upload placeholders, Knowledge Graph stub.
