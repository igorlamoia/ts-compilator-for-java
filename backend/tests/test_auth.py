import os
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.factories import create_organization, create_user
from app.models.user import UserRole


class TestRegister:
    async def test_register_creates_user_and_returns_token(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        payload = {
            "email": "new@example.com",
            "password": "secret123",
            "name": "New User",
            "organization_id": org.id,
        }

        # Act
        response = await async_client.post("/auth/register", json=payload)

        # Assert
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    async def test_register_fails_for_duplicate_email(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        await create_user(async_session, org, email="duplicate@example.com")
        payload = {
            "email": "duplicate@example.com",
            "password": "secret123",
            "name": "Another User",
            "organization_id": org.id,
        }

        # Act
        response = await async_client.post("/auth/register", json=payload)

        # Assert
        assert response.status_code == 409

    async def test_register_fails_for_invalid_organization(
        self, async_client: AsyncClient
    ):
        # Arrange
        payload = {
            "email": "user@example.com",
            "password": "secret123",
            "name": "User",
            "organization_id": "nonexistent-org-id",
        }

        # Act
        response = await async_client.post("/auth/register", json=payload)

        # Assert
        assert response.status_code == 404


class TestLogin:
    async def test_login_returns_token(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        await create_user(async_session, org, email="login@example.com", password="mypassword")
        payload = {"email": "login@example.com", "password": "mypassword"}

        # Act
        response = await async_client.post("/auth/login", json=payload)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_fails_for_wrong_password(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        await create_user(async_session, org, email="wrongpw@example.com", password="correct")
        payload = {"email": "wrongpw@example.com", "password": "wrong"}

        # Act
        response = await async_client.post("/auth/login", json=payload)

        # Assert
        assert response.status_code == 401

    async def test_login_fails_for_unknown_email(
        self, async_client: AsyncClient
    ):
        # Arrange
        payload = {"email": "nobody@example.com", "password": "secret"}

        # Act
        response = await async_client.post("/auth/login", json=payload)

        # Assert
        assert response.status_code == 401


class TestMe:
    async def test_me_returns_current_user(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        # Arrange
        org = await create_organization(async_session)
        user = await create_user(async_session, org, email="me@example.com", password="secret")
        login_response = await async_client.post(
            "/auth/login", json={"email": "me@example.com", "password": "secret"}
        )
        token = login_response.json()["access_token"]

        # Act
        response = await async_client.get(
            "/auth/me", headers={"Authorization": f"Bearer {token}"}
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "me@example.com"
        assert data["id"] == user.id

    async def test_me_fails_without_token(self, async_client: AsyncClient):
        # Act
        response = await async_client.get("/auth/me")

        # Assert
        assert response.status_code == 403

    async def test_me_fails_with_invalid_token(self, async_client: AsyncClient):
        # Act
        response = await async_client.get(
            "/auth/me", headers={"Authorization": "Bearer invalid.token.here"}
        )

        # Assert
        assert response.status_code == 401
