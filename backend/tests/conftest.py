import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base
from app.dependencies.db import get_db
import app.models as _app_models  # ensure all models are registered with Base

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture
async def client():
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_maker = async_sessionmaker(engine, expire_on_commit=False)

    async def override_get_db():
        async with session_maker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def doctor_client(client):
    await client.post("/auth/register", json={
        "email": "doctor@test.com",
        "password": "password123",
        "role": "Doctor",
        "first_name": "Test",
        "last_name": "Doctor",
    })
    resp = await client.post("/auth/login", json={
        "email": "doctor@test.com",
        "password": "password123",
    })
    token = resp.json()["access_token"]
    return client, {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def pharmacist_client(client):
    await client.post("/auth/register", json={
        "email": "pharmacist@test.com",
        "password": "password123",
        "role": "Pharmacist",
        "first_name": "Test",
        "last_name": "Pharmacist",
    })
    resp = await client.post("/auth/login", json={
        "email": "pharmacist@test.com",
        "password": "password123",
    })
    token = resp.json()["access_token"]
    return client, {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def admin_client(client):
    await client.post("/auth/register", json={
        "email": "admin@test.com",
        "password": "password123",
        "role": "Admin",
        "first_name": "Test",
        "last_name": "Admin",
    })
    resp = await client.post("/auth/login", json={
        "email": "admin@test.com",
        "password": "password123",
    })
    token = resp.json()["access_token"]
    return client, {"Authorization": f"Bearer {token}"}


SAMPLE_PATIENT = {
    "first_name": "Jane",
    "last_name": "Smith",
    "date_of_birth": "1990-05-15",
    "gender": "Female",
    "email": "jane.smith@example.com",
    "phone": "07700900000",
    "address": "1 Test Street",
}
