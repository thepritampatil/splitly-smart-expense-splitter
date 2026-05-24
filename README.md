# Splitly — Collaborative Expense & Settlement Platform

> A full-stack, production-ready SaaS application for groups to split expenses, track balances, and settle debts transparently.

---

## 🎯 Product Overview

Splitly solves the real-world problem of shared finance confusion in:
- 🏠 Hostel / PG groups
- 🏖️ Trip groups
- 🛏️ Flatmates / Roommates
- 🎓 College events
- 💼 Office outings

**Core principles:** Fairness · Transparency · Trust · Optimized settlements

---

## 🛠 Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18 + Vite, Tailwind CSS, Framer Motion, Recharts, Zustand, React Hook Form |
| Backend   | Java 21, Spring Boot 3.2, Spring Security, JWT, Spring Data JPA |
| Database  | PostgreSQL (production) / H2 in-memory (development) |
| Auth      | JWT Bearer tokens with BCrypt password hashing |

---

## 🏗 Architecture

```
splitly/
├── frontend/                  # React + Vite SPA
│   └── src/
│       ├── pages/             # Route-level pages
│       ├── components/        # Reusable components
│       │   ├── ui/            # Design system components
│       │   ├── layouts/       # AppLayout with sidebar
│       │   └── modals/        # Feature modals
│       ├── store/             # Zustand state stores
│       └── services/          # Axios API client
│
└── backend/                   # Spring Boot REST API
    └── src/main/java/com/splitly/
        ├── controller/        # REST controllers
        ├── service/           # Business logic
        ├── repository/        # JPA repositories
        ├── model/             # JPA entities
        ├── dto/               # Request/response DTOs
        ├── security/          # JWT filter + UserDetails
        ├── algorithm/         # Debt optimization algorithm
        ├── config/            # Security + CORS config
        └── exception/         # Global exception handler
```

---

## 🧮 Debt Optimization Algorithm

The core DSA component uses a **Greedy Algorithm** with two priority queues:

```
Time Complexity:  O(N log N)
Space Complexity: O(N)
```

**How it works:**
1. Calculate net balance per person (paid - owed)
2. Separate into creditors (+) and debtors (-)
3. Greedily match largest creditor ↔ largest debtor
4. Generate minimum transactions

**Example:**
```
Instead of: A→B ₹50, A→C ₹50, A→D ₹50
Optimized:  B→A ₹50, C→A ₹50, D→A ₹50  (already optimal)

Chain: A owes B ₹100, B owes C ₹100
→ Net: A=-100, B=0, C=+100
→ Optimized: A→C ₹100 (1 txn instead of 2)
```

---

## 💳 Settlement Workflow

```
Rahul owes Pritam ₹500

Step 1: Rahul clicks "Pay" → Status: PROCESSING
Step 2: Pritam sees notification
Step 3: Pritam clicks "Confirm" → Status: COMPLETED
         ↓
    ✅ Balances auto-updated
    ✅ Activity logged
```

---

## 🚀 Local Setup Guide

### Prerequisites
- Java 21+
- Node.js 18+
- Maven 3.8+
- (Optional) PostgreSQL 15+ for production mode

---

### Backend Setup

```bash
cd splitly/backend

# Run with H2 in-memory database (default)
./mvnw spring-boot:run

# Run with PostgreSQL
export SPRING_PROFILE=prod
export DATABASE_URL=jdbc:postgresql://localhost:5432/splitlydb
export DB_USERNAME=postgres
export DB_PASSWORD=yourpassword
./mvnw spring-boot:run
```

**H2 Console** (dev mode): http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:splitlydb`
- Username: `sa`, Password: (empty)

---

### Frontend Setup

```bash
cd splitly/frontend

# Install dependencies
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:8080" > .env.local

# Start dev server
npm run dev
```

Frontend runs on: http://localhost:5173

---

### PostgreSQL Setup (Production)

```sql
CREATE DATABASE splitlydb;
CREATE USER splitly WITH ENCRYPTED PASSWORD 'splitly_password';
GRANT ALL PRIVILEGES ON DATABASE splitlydb TO splitly;
```

---

## 🌍 Deployment Guide

### Frontend → Vercel

```bash
cd frontend
npm run build

# Or deploy with Vercel CLI
npx vercel --prod
```

Set environment variable in Vercel:
```
VITE_API_URL=https://your-backend.railway.app
```

### Backend → Railway

1. Create new Railway project
2. Add PostgreSQL service
3. Deploy backend with these env vars:

```env
SPRING_PROFILE=prod
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
CORS_ORIGINS=https://your-frontend.vercel.app
```

### Backend → Render

1. New Web Service → connect GitHub repo
2. Build Command: `cd backend && ./mvnw package -DskipTests`
3. Start Command: `java -jar backend/target/splitly-backend-1.0.0.jar`
4. Add same environment variables as above

---

## 📡 API Reference

### Auth
```
POST /api/auth/signup    { fullName, email, password }
POST /api/auth/login     { email, password }
```

### Groups
```
GET    /api/groups
POST   /api/groups
GET    /api/groups/:id
PUT    /api/groups/:id
POST   /api/groups/:id/archive
POST   /api/groups/:id/invite     { email }
POST   /api/groups/:id/accept
DELETE /api/groups/:id/members/:userId
GET    /api/groups/pending
```

### Expenses
```
GET    /api/expenses/group/:groupId
POST   /api/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id
GET    /api/expenses/group/:groupId/balances
```

### Settlements
```
GET    /api/settlements/group/:groupId
GET    /api/settlements/group/:groupId/optimized
POST   /api/settlements/pay       { receiverId, amount, groupId }
POST   /api/settlements/confirm   { settlementId }
POST   /api/settlements/:id/decline
```

### Analytics
```
GET /api/analytics/monthly/:groupId
GET /api/analytics/category/:groupId
```

### Others
```
GET  /api/users/me
PUT  /api/users/me
GET  /api/users/search?query=
GET  /api/friends
GET  /api/activities
GET  /api/activities/group/:groupId
GET  /api/messages/group/:groupId
POST /api/messages
```

---

## 🧪 Running Tests

```bash
cd backend
./mvnw test
```

Tests cover:
- `DebtOptimizationAlgorithmTest` — 7 test cases for algorithm correctness
- Zero balances, simple debt, chain optimization, four-person scenarios

---

## 📱 Features

### ✅ Implemented
- JWT authentication with BCrypt
- Group creation with types (Hostel/Trip/Flatmates/College/Office)
- Admin/Member role system
- Equal and Exact expense splitting
- Automatic balance calculation
- Debt optimization algorithm (greedy)
- Two-step settlement workflow (PROCESSING → COMPLETED)
- Activity feed with full audit log
- Group discussion/messaging system
- Friend list (auto-populated from groups)
- Analytics with monthly, category charts
- Dark-mode SaaS UI with Framer Motion animations
- Mobile responsive with collapsible sidebar

### 🔮 Future Improvements
- Real-time updates via WebSocket
- Push notifications for payment requests
- Export to PDF/CSV
- UPI deep-link integration
- Recurring expenses
- Receipt photo upload
- Multi-currency support

---

## 📸 Screenshots

> Add screenshots after running the app locally.

- Landing Page
- Dashboard with stats
- Group detail with tabs
- Expense split modal
- Settlement workflow
- Analytics charts

---

## 👨‍💻 Author

Built as a production-quality full-stack project demonstrating:
- Spring Boot REST API design
- JWT security implementation
- DSA (greedy algorithm for debt optimization)
- React state management with Zustand
- Modern SaaS UI/UX patterns
