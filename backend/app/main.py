# NECESSITY: FastAPI application entry point
# LOGIC: Creates app with CORS, lifespan, and health check
# EDGE-CASE: Handles startup/shutdown events for database connection

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db, close_db
from app.api.v1.auth_router import router as auth_router
from app.api.v1.product_router import router as product_router
from app.api.v1.cart_router import router as cart_router
from app.api.v1.order_router import router as order_router
from app.api.v1.ledger_router import router as ledger_router
from app.api.v1.transport_router import router as transport_router
from app.api.v1.admin_router import router as admin_router


# NECESSITY: Lifespan context manager for startup/shutdown events
# LOGIC: Initializes database on startup, closes on shutdown
# EDGE-CASE: Ensures clean resource management
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


# NECESSITY: FastAPI application instance with configuration
# LOGIC: Uses settings for consistent configuration
# EDGE-CASE: CORS must match frontend origin exactly
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# NECESSITY: CORS middleware for cross-origin requests
# LOGIC: Allows frontend to call backend API
# EDGE-CASE: Must include specific origins, not wildcards in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NECESSITY: Mount API routers
# LOGIC: Each router handles a feature domain
# EDGE-CASE: Prefix ensures all endpoints are versioned under /api/v1
app.include_router(auth_router, prefix="/api/v1")
app.include_router(product_router, prefix="/api/v1")
app.include_router(cart_router, prefix="/api/v1")
app.include_router(order_router, prefix="/api/v1")
app.include_router(ledger_router, prefix="/api/v1")
app.include_router(transport_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")


@app.get("/api/health")
async def health_check():
    """
    Health check endpoint.
    
    NECESSITY: Used by load balancers and monitoring
    LOGIC: Returns status and version
    EDGE-CASE: None - simple response
    """
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": "development" if settings.DEBUG else "production",
    }


@app.get("/")
async def root():
    """
    Root endpoint with API information.
    
    NECESSITY: Provides basic API information
    LOGIC: Returns name, version, and docs link
    EDGE-CASE: None - simple response
    """
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/health",
    }
