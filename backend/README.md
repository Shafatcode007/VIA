# VIA Backend

FastAPI backend for the VIA Multi-Service Platform.

## Setup

1. Create virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

4. Run database migrations:
   ```bash
   alembic upgrade head
   ```

5. Start the server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

6. Open API docs:
   ```
   http://localhost:8000/docs
   ```

## Project Structure

```
backend/
├── app/
│   ├── api/v1/        # API routers
│   ├── core/          # Config, database, security
│   ├── models/        # SQLAlchemy models
│   ├── repositories/  # Data access layer
│   ├── schemas/       # Pydantic schemas
│   └── services/      # Business logic
├── alembic/           # Database migrations
├── seed/              # Seed data scripts
├── tests/             # Pytest tests
└── requirements.txt
```

## Development

- Run tests: `pytest -v`
- Check coverage: `pytest --cov=app`
- Lint: `flake8 app/`
- Type check: `mypy app/`
