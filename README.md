# 401(k) Contribution Manager

A full-stack application for managing 401(k) contributions, featuring a React frontend and Node.js/Express backend with SQLite database.

## Features

- **Contribution Management**: Set contributions as a percentage of salary or fixed dollar amount.
- **Real-time Updates**: Interactive sliders and inputs with immediate feedback.
- **YTD Visualization**: View Year-to-Date contribution statistics with employer match tracking.
- **Retirement Projection**: Visualize how your current contribution rate affects your retirement savings over time.
- **Premium UI**: Modern, responsive design using Mantine UI.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Mantine UI, Recharts, Currency.js
- **Backend**: Node.js, Express, TypeScript, Prisma, SQLite
- **Tools**: npm workspaces, concurrently

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   This command generates the Prisma client, runs migrations, and seeds the database with mock data.
   ```bash
   npm run setup
   ```

3. **Run Application**
   Starts both backend (port 3001) and frontend (port 5173) concurrently.
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to [http://localhost:5173](http://localhost:5173) to use the application.

## API Endpoints

- `GET /api/user`: Fetch user profile and current settings
- `POST /api/contribution`: Update contribution rate
- `GET /api/contribution/ytd`: Get YTD statistics
- `POST /api/contribution/calculate-impact`: Calculate retirement projection

## Architecture

The project uses a monorepo structure:
- `/backend`: Express server with Prisma ORM and business logic
- `/frontend`: React application with Vite build tool

## Demo User Profiles

The application is seeded with **four demo users** with different financial profiles:

| Name | Email | Salary | Age |
|------|-------|--------|-----|
| Alex Lewis | alex.lewis@company.com | $75,000 | 29
| Jordan Chen | jordan.chen@company.com | $120,000 | 39
| Sam Patel | sam.patel@company.com | $45,000 | 24
| Morgan Taylor | morgan.taylor@company.com | $95,000 | 46

### Switching Between Users

To test different user profiles **without exposing this functionality to the frontend**:

1. **Create a `.env` file** in the `backend/` directory (or copy from `.env.example`):
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Set the user email** in `backend/.env`:
   ```
   DEMO_USER_EMAIL=jordan.chen@company.com
   ```

3. **Restart the backend server** for changes to take effect:
   ```bash
   npm run dev
   ```

> **Note**: If `DEMO_USER_EMAIL` is not set, the application defaults to the first user (Alex Lewis).

### Employer Match Details

- **Match Rate**: 50% of employee contribution
- **Match Cap**: Up to 3% of salary
- **Annual Return**: 7% growth rate (used for projections)
