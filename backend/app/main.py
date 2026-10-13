import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .seed import seed_database
from .routers import dashboard, incomes, expenses, loans, investments, budgets, recurring, settings, export_import


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables and seed data
    Base.metadata.create_all(bind=engine)
    try:
        seed_database(force=False)
    except Exception as e:
        print(f"Seed error: {e}")
    yield


app = FastAPI(
    title="Personal Finance Tracker API",
    description="High-performance FastAPI & PostgreSQL backend for Personal Finance Tracking",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(dashboard.router)
app.include_router(incomes.router)
app.include_router(expenses.router)
app.include_router(loans.router)
app.include_router(investments.router)
app.include_router(budgets.router)
app.include_router(recurring.router)
app.include_router(settings.router)
app.include_router(export_import.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Finance Tracker API", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
