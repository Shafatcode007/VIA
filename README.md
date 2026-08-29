# VIA — Location-Focused Multi-Service MVP

**Course:** CSE327 — Software Engineering
**Project Type:** Location-Focused Multi-Service Platform
**Team:** Shafat & Contributors
**Repository:** https://github.com/Shafatcode007/VIA

---

## Problem Statement

Dhaka residents face fragmented services for housing, grocery shopping, and transport. Rental listings lack transparent verification. Grocery shopping requires visiting multiple stores for the best price. Transport fare estimation is opaque. VIA unifies these services into a single location-aware platform with price comparison, cart optimization, and a virtual payment ledger.

## Target Users

| Role | Description |
|------|-------------|
| **Resident** | End consumer — browses rentals, shops groceries, books transport, uses recipes |
| **Landlord** | Lists rental properties, manages claims and verification |
| **Seller** | Lists grocery products, sets prices, fulfills orders |
| **Driver** | Accepts transport bookings, provides rides |
| **Admin** | Verifies listings, monitors orders, manages ledger, oversees platform |

## Core Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Authentication & RBAC** | 5 user roles with scoped permissions, JWT + bcrypt |
| 2 | **Rental Listings + Claim** | 15 seed listings, search/filter, claim workflow, Leaflet map |
| 3 | **Grocery + Price Comparison** | Canonical items, multi-seller prices, unit normalization |
| 4 | **Multi-Seller Cart Optimization** | Cheapest fulfillment strategy across sellers |
| 5 | **Master Order + Virtual Ledger** | Atomic checkout, sub-order splitting, seller credit distribution |
| 6 | **Transport Booking** | Fare estimation, ride booking, driver assignment simulation |
| 7 | **Recipe-to-Cart** | Dish → ingredients → auto cart fill |
| 8 | **Admin Dashboard** | Verify listings, monitor orders, view ledger, analytics |

## Optional Polish Features

| # | Feature | Description |
|---|---------|-------------|
| 9 | AI Chatbot | Natural language interface via Ollama + Qwen2.5 |
| 10 | OCR Price List Upload | Seller uploads handwritten lists → OCR extraction |
| 11 | RAG Recipe Explanation | Vector-based recipe step explanation |

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14 + Tailwind CSS | Modern, fast, component-driven |
| Backend | Python + FastAPI + SQLAlchemy | Async, auto API docs, clean architecture |
| Database | PostgreSQL 14+ | Relational integrity, ACID, JSON support |
| Maps | Leaflet.js + OpenStreetMap | Free, no API key required |
| Auth | JWT + bcrypt | Industry standard, RBAC |
| Version Control | Git + GitHub | Collaboration & CI/CD |
| Testing | pytest (backend) + manual UI | Core logic validation |

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│         (Pages, Components, API Client, Hooks)           │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (JSON)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   FastAPI Backend                        │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐             │
│  │ Routers │─▶│ Services │─▶│Repository  │             │
│  │ (API)   │  │ (Logic)  │  │ (Data)     │             │
│  └─────────┘  └──────────┘  └─────┬──────┘             │
│                                    │                     │
│                            ┌───────▼──────┐             │
│                            │  SQLAlchemy   │             │
│                            │   Models      │             │
│                            └───────┬──────┘             │
└────────────────────────────────────┼────────────────────┘
                                     │
                                     ▼
                            ┌────────────────┐
                            │   PostgreSQL    │
                            │   Database      │
                            └────────────────┘
```

## Folder Structure

```
VIA/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/          # Config, security, database, exceptions
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── repositories/  # Database access layer
│   │   ├── services/      # Business logic layer
│   │   └── api/v1/        # FastAPI routers
│   ├── tests/             # pytest tests
│   ├── seed/              # Seed data files
│   └── requirements.txt
├── frontend/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── lib/               # API client, utils, types
│   └── package.json
├── docs/                  # Project documentation
└── README.md
```

## Local Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/Shafatcode007/VIA.git
cd VIA
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Environment Variables
```bash
# backend/.env
DATABASE_URL=postgresql://user:password@localhost:5432/via_db
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 4. Database Setup
```bash
# Create database
createdb via_db

# Run migrations
alembic upgrade head

# Seed data
python -m app.seed.seed_all
```

### 5. Run Backend
```bash
uvicorn app.main:app --reload --port 8000
# API docs at http://localhost:8000/docs
```

### 6. Run Frontend
```bash
cd frontend
npm install
npm run dev
# App at http://localhost:3000
```

## Demo Order

1. Register as Resident → Login
2. Browse rental listings on map → Claim a listing
3. Login as Admin → Verify the claimed listing
4. Browse grocery items → Compare seller prices
5. Add items to cart → Run cart optimization
6. Checkout → Mock payment → Show order splitting
7. Check virtual ledger entries
8. Book a transport ride → Show fare estimation
9. Browse recipes → Add recipe ingredients to cart
10. Login as Admin → Show dashboard analytics

## Testing

```bash
# Backend tests
cd backend
pytest -v

# Manual UI testing
# Follow demo script in docs/DEMO_SCRIPT.md
```

## Project Status

| Milestone | Feature | Status |
|-----------|---------|--------|
| 1 | Repository & Skeleton Setup | ⬜ |
| 2 | Authentication & RBAC | ⬜ |
| 3 | Rental Listings + Claim | ⬜ |
| 4 | Grocery + Price Comparison | ⬜ |
| 5 | Cart CRUD | ⬜ |
| 6 | Cart Optimization Engine | ⬜ |
| 7 | Checkout + Payment + Ledger | ⬜ |
| 8 | Transport Booking | ⬜ |
| 9 | Recipe-to-Cart | ⬜ |
| 10 | Admin Dashboard | ⬜ |
| 11 | Seed Data + Testing + Demo | ⬜ |

## Documentation

| Document | Purpose |
|----------|---------|
| [Project Plan](docs/PROJECT_PLAN.md) | Milestones, timeline, priorities |
| [Architecture](docs/ARCHITECTURE.md) | System design, layers, diagrams |
| [Folder Structure](docs/FOLDER_STRUCTURE.md) | File organization |
| [Database Schema](docs/DATABASE_SCHEMA.md) | Tables, relationships, ER diagrams |
| [API Contract](docs/API_CONTRACT.md) | REST endpoint definitions |
| [Dataflows](docs/DATAFLOWS.md) | End-to-end feature flows |
| [Demo Script](docs/DEMO_SCRIPT.md) | Live demo walkthrough |
| [Faculty Q&A](docs/FACULTY_QNA.md) | Faculty interview prep |
| [Agent Rules](docs/AGENT_RULES.md) | AI coding agent rules |
| [Implementation Checklist](docs/IMPLEMENTATION_CHECKLIST.md) | Task-by-task checklist |

## License

This project is for CSE327 academic purposes.
