# FX Journal Web 📈

A modern, high-performance trading journal application built for serious Forex and Crypto traders. 
Designed to enforce discipline through a rigid "Plan first, Execute second" workflow.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Key Features

*   **Hybrid Trade Lifecycle**: Distinct phases for **Planning** (Pre-trade) and **Execution** (Post-trade).
*   **Advanced Image Handling**: 
    *   Secure Cloudflare R2 storage.
    *   Compulsory Setup Charts to ensure easy review.
    *   Optional Confirmation/Trigger charts.
    *   Smart "Temp-to-Perm" storage management to keep your cloud bucket clean.
*   **Rich Analytics**: Visualize Win Rate, PnL, Drawdown, and Equity Curves.
*   **Strategy Specifics**: 
    *   **Supply & Demand**: Log Zone Types (RBR, DBD, etc.) and Entry Models.
    *   **ICT**: Log PD Arrays, Killzones, and Models.
*   **Psychology Tracking**: Record emotions before and after every trade.
*   **Modern UI**: Built with Tailwind CSS, Glassmorphism, and fully responsive design.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Database**: [Firebase Firestore](https://firebase.google.com/)
*   **Storage**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (AWS SDK v3 compatible)
*   **Authentication**: Firebase Auth
*   **Charts**: Recharts

## ⚙️ Installation & Setup

### 1. Prerequisites
*   Node.js 18+ installed.
*   A Firebase Project (Firestore & Auth enabled).
*   A Cloudflare Account (for R2 Storage).

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/fx-journal-web.git
cd fx-journal-web
```

### 3. Install Dependencies
```bash
npm install
# or
yarn install
```

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory and add the following keys:

```env
# FIREBASE CONFIGURATION
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# CLOUDFLARE R2 STORAGE
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-custom-domain.com
```

### 5. Setup Cloudflare R2
For detailed instructions on creating buckets and configuring CORS, see the **[R2 Setup Guide](docs/r2-setup.md)**.

## 🏃‍♂️ Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📂 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/             # API Routes (R2 uploads, etc.)
│   ├── history/         # Trade History Page
│   ├── trades/[id]/     # Trade Details Page
│   └── page.tsx         # Dashboard (Home)
├── components/
│   ├── features/        # Business logic components (Forms, Charts)
│   ├── ui/              # Reusable UI atoms (Buttons, Inputs)
│   └── admin/           # Admin-specific components
├── context/             # React Context (Auth)
├── lib/                 # Utilities & Services
│   ├── services/        # Firebase Service layers
│   └── firebase.ts      # Firebase Init
└── types/               # TypeScript Definitions
```

## 📖 Documentation
*   [User Manual](docs/user_manual.md)
*   [R2 Storage Setup](docs/r2-setup.md)

## 📄 License
This project is licensed under the MIT License.
