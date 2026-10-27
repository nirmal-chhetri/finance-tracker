from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from app.database import init_db, engine, get_session
from app.seed import seed_database

from app.routers import (
    currencies,
    accounts,
    categories,
    transactions,
    budgets,
    recurring,
    goals,
    debts,
    analytics,
    importer
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and seed defaults
    init_db()
    with Session(engine) as session:
        seed_database(session)
    yield

app = FastAPI(
    title="Personal Finance Command Center API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local client development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(currencies.router)
app.include_router(accounts.router)
app.include_router(categories.router)
app.include_router(transactions.router)
app.include_router(budgets.router)
app.include_router(recurring.router)
app.include_router(goals.router)
app.include_router(debts.router)
app.include_router(analytics.router)
app.include_router(importer.router)

@app.get("/api/health")
def health():
    return {"status": "ok", "app": "Personal Finance Tracker"}
