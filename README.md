# Inventory Management System

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

> **_NOTE:_** This application was built as a Final Project under the discipline/course - **Basics of Information Systems** (INFT3107) at **Kazakh-British Technical University**, showcasing a complete understanding of modern full-stack development and cloud deployment practices.

## Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [UI/UX Design](#uiux-design)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)

## Project Overview

This is a complete Full Stack Inventory Management Dashboard Application designed to streamline business operations. It allows users to track inventory, manage products, monitor sales and purchases, and view expense summaries through an interactive dashboard.

The application is built using **Next.js** for a high-performance frontend, styled with **Tailwind CSS**, and utilizes **Material UI Data Grid** for handling complex datasets. State management is robustly handled by **Redux Toolkit** and **RTK Query**. The backend is powered by **Node.js** and **Express**, using **Prisma ORM** for seamless database interactions with PostgreSQL.

The project also includes a comprehensive deployment strategy using **AWS** services including RDS, EC2, API Gateway, Amplify, and S3.

## Tech Stack

### Frontend
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [Material UI](https://mui.com/) (Data Grid, Base components)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) & [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- **Authentication:** [Clerk](https://clerk.com/)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Utilities:** Numeral.js, UUID, Axios

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Language:** TypeScript
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL
- **Security/Utils:** Helmet, Morgan, Body-parser, Cors

### DevOps & Cloud (AWS)
- **Compute:** AWS EC2 (Backend hosting)
- **Database:** AWS RDS (PostgreSQL)
- **API Management:** AWS API Gateway
- **Frontend Hosting:** AWS Amplify
- **Storage:** AWS S3 (Image/File storage)
- **Process Management:** PM2 (for Node.js on EC2)

## Features

- **Dashboard:** Real-time overview of sales, purchases, expenses, and popular products.
- **Authentication:** Secure Sign-in/Sign-up with Clerk, including route protection.
- **User Management:** Admin-controlled user list with deletion capabilities.
- **Profile Settings:** Update user details, change passwords, and upload profile pictures.
- **Product Management:** Create new products, view ratings, and pricing.
- **Expense Tracking:** Categorized expense views and summaries.

## UI/UX Design

<img width="1918" height="961" alt="image" src="https://github.com/user-attachments/assets/183e27e8-3fa4-4944-8fa1-d29668b143e1" />

## Architecture

The application follows a client-server architecture:
- **Client:** Next.js application serving the UI and consuming APIs.
- **Server:** Node.js/Express REST API handling business logic and database operations.
- **Database:** PostgreSQL database managed via Prisma.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (Local or Cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sultanjke/inventory-management-system.git
   cd inventory-management-system
   ```

2. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Environment Setup

#### Server (`server/.env`)
Create a `.env` file in the `server` directory:
```env
PORT=8000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

#### Client (`client/.env.local`)
Create a `.env.local` file in the `client` directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Database Setup
Navigate to the server directory and run the Prisma migrations and seed command:
```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

## Running the Application

You can run both the client and server concurrently or in separate terminals.

**Option 1: Separate Terminals**

*Terminal 1 (Server):*
```bash
cd server
npm run dev
```

*Terminal 2 (Client):*
```bash
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:8000) to view the application.

## Deployment

### AWS Cloud Architecture

<img width="816" height="520" alt="Frame 1" src="https://github.com/user-attachments/assets/64ef3af8-b6f2-4d27-8afc-fbc8ee3dbeb9" />

### AWS Deployment Strategy

1. **Database (RDS):**
   - Set up a PostgreSQL instance on AWS RDS.
   - Update `DATABASE_URL` in the server environment variables to point to the RDS endpoint.

2. **Backend (EC2):**
   - Launch an EC2 instance (e.g., Ubuntu).
   - Install Node.js, NPM, and PM2.
   - Clone the repo and setup the `server` directory.
   - Use `ecosystem.config.js` to manage the process with PM2.
   - Configure Security Groups to allow traffic on the API port.

3. **API Gateway:**
   - (Optional) Set up API Gateway to route requests to your EC2 instance for better management and security.

4. **Frontend (Amplify):**
   - Connect your repository to AWS Amplify.
   - Configure build settings for Next.js.
   - Set environment variables (`NEXT_PUBLIC_API_BASE_URL`) in the Amplify console to point to your EC2/API Gateway URL.

5. **Storage (S3):**
   - Create an S3 bucket for storing uploaded images or static assets if required.

---
Contact me @ [Telegram](https://t.me/mecheyev)
