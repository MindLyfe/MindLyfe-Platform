from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.gzip import GZipMiddleware
from prometheus_client import make_asgi_app

from app.core.config import settings
from app.api.v1.api import api_router
from app.core.dependencies import get_token_header

# Create FastAPI app
app = FastAPI(
    title="MindLyf AI Service",
    description="AI Personalization Service for MindLyf Platform",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Add metrics endpoint for Prometheus
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Include API router
app.include_router(
    api_router,
    prefix="/api/v1",
    dependencies=[Depends(get_token_header)],
)

# Health check endpoint
@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "service": "ai-service"}

# Customize OpenAPI schema
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="MindLyf AI Service API",
        version="0.1.0",
        description="AI Personalization Service for the MindLyf Platform",
        routes=app.routes,
    )
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi 