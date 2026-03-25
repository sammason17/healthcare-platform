import pytest

REGISTER_PAYLOAD = {
    "email": "user@test.com",
    "password": "password123",
    "role": "Doctor",
    "first_name": "Test",
    "last_name": "User",
}


async def test_register_success(client):
    resp = await client.post("/auth/register", json=REGISTER_PAYLOAD)
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "user@test.com"
    assert data["role"] == "Doctor"
    assert "id" in data
    assert "password_hash" not in data


async def test_register_duplicate_email(client):
    await client.post("/auth/register", json=REGISTER_PAYLOAD)
    resp = await client.post("/auth/register", json=REGISTER_PAYLOAD)
    assert resp.status_code == 400
    assert "already registered" in resp.json()["detail"].lower()


async def test_register_invalid_email(client):
    payload = {**REGISTER_PAYLOAD, "email": "not-an-email"}
    resp = await client.post("/auth/register", json=payload)
    assert resp.status_code == 422


async def test_register_short_password(client):
    payload = {**REGISTER_PAYLOAD, "password": "abc"}
    resp = await client.post("/auth/register", json=payload)
    assert resp.status_code == 422


async def test_login_success(client):
    await client.post("/auth/register", json=REGISTER_PAYLOAD)
    resp = await client.post("/auth/login", json={
        "email": "user@test.com",
        "password": "password123",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "Doctor"
    assert "user_id" in data


async def test_login_wrong_password(client):
    await client.post("/auth/register", json=REGISTER_PAYLOAD)
    resp = await client.post("/auth/login", json={
        "email": "user@test.com",
        "password": "wrongpassword",
    })
    assert resp.status_code == 401


async def test_login_nonexistent_user(client):
    resp = await client.post("/auth/login", json={
        "email": "nobody@test.com",
        "password": "password123",
    })
    assert resp.status_code == 401


async def test_protected_route_without_token(client):
    resp = await client.get("/patients")
    assert resp.status_code == 401


async def test_protected_route_with_invalid_token(client):
    resp = await client.get("/patients", headers={"Authorization": "Bearer invalidtoken"})
    assert resp.status_code == 401
