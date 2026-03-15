import os
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.factories import create_organization, create_user
from app.models.user import UserRole


async def get_token(client: AsyncClient, email: str, password: str) -> str:
    r = await client.post("/auth/login", json={"email": email, "password": password})
    return r.json()["access_token"]


class TestCreateClass:
    async def test_teacher_can_create_class(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher1@ex.com", password="secret")
        token = await get_token(async_client, "teacher1@ex.com", "secret")

        response = await async_client.post(
            "/classes",
            json={"name": "Java Basics", "description": "Intro", "access_code": "ABC123"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Java Basics"
        assert data["teacher_id"] == teacher.id

    async def test_student_cannot_create_class(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_c1@ex.com", password="secret")
        token = await get_token(async_client, "student_c1@ex.com", "secret")

        response = await async_client.post(
            "/classes",
            json={"name": "Bad", "description": "no", "access_code": "X9"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403

    async def test_duplicate_access_code_fails(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher2@ex.com", password="secret")
        token = await get_token(async_client, "teacher2@ex.com", "secret")

        await async_client.post(
            "/classes",
            json={"name": "First", "description": "d", "access_code": "DUP999"},
            headers={"Authorization": f"Bearer {token}"},
        )
        response = await async_client.post(
            "/classes",
            json={"name": "Second", "description": "d", "access_code": "DUP999"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 409


class TestListClasses:
    async def test_teacher_sees_own_classes(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher3@ex.com", password="secret")
        token = await get_token(async_client, "teacher3@ex.com", "secret")

        await async_client.post(
            "/classes",
            json={"name": "My Class", "description": "d", "access_code": "MY001"},
            headers={"Authorization": f"Bearer {token}"},
        )

        response = await async_client.get("/classes", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        data = response.json()
        assert any(c["name"] == "My Class" for c in data)


class TestJoinClass:
    async def test_student_can_join_with_valid_code(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher4@ex.com", password="secret")
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_c2@ex.com", password="secret")
        teacher_token = await get_token(async_client, "teacher4@ex.com", "secret")
        student_token = await get_token(async_client, "student_c2@ex.com", "secret")

        create_resp = await async_client.post(
            "/classes",
            json={"name": "Join Test", "description": "d", "access_code": "JOIN1"},
            headers={"Authorization": f"Bearer {teacher_token}"},
        )
        class_id = create_resp.json()["id"]

        response = await async_client.post(
            f"/classes/{class_id}/join",
            json={"access_code": "JOIN1"},
            headers={"Authorization": f"Bearer {student_token}"},
        )

        assert response.status_code == 200

    async def test_join_fails_with_wrong_code(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher5@ex.com", password="secret")
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_c3@ex.com", password="secret")
        teacher_token = await get_token(async_client, "teacher5@ex.com", "secret")
        student_token = await get_token(async_client, "student_c3@ex.com", "secret")

        create_resp = await async_client.post(
            "/classes",
            json={"name": "Wrong Code Test", "description": "d", "access_code": "CORRECT1"},
            headers={"Authorization": f"Bearer {teacher_token}"},
        )
        class_id = create_resp.json()["id"]

        response = await async_client.post(
            f"/classes/{class_id}/join",
            json={"access_code": "WRONG"},
            headers={"Authorization": f"Bearer {student_token}"},
        )

        assert response.status_code == 400


class TestGetClass:
    async def test_get_class_by_id(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher6@ex.com", password="secret")
        token = await get_token(async_client, "teacher6@ex.com", "secret")

        create_resp = await async_client.post(
            "/classes",
            json={"name": "Detail Test", "description": "d", "access_code": "DET001"},
            headers={"Authorization": f"Bearer {token}"},
        )
        class_id = create_resp.json()["id"]

        response = await async_client.get(
            f"/classes/{class_id}", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        assert response.json()["id"] == class_id
        assert response.json()["name"] == "Detail Test"

    async def test_get_class_not_found(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher7@ex.com", password="secret")
        token = await get_token(async_client, "teacher7@ex.com", "secret")

        response = await async_client.get(
            "/classes/999999", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 404


class TestRemoveMember:
    async def test_teacher_can_remove_member(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher8@ex.com", password="secret")
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_r1@ex.com", password="secret")
        teacher_token = await get_token(async_client, "teacher8@ex.com", "secret")
        student_token = await get_token(async_client, "student_r1@ex.com", "secret")

        create_resp = await async_client.post(
            "/classes",
            json={"name": "Remove Test", "description": "d", "access_code": "REM001"},
            headers={"Authorization": f"Bearer {teacher_token}"},
        )
        class_id = create_resp.json()["id"]

        join_resp = await async_client.post(
            f"/classes/{class_id}/join",
            json={"access_code": "REM001"},
            headers={"Authorization": f"Bearer {student_token}"},
        )
        assert join_resp.status_code == 200

        # Pegar o student_id do token de login
        me_resp = await async_client.get(
            "/auth/me", headers={"Authorization": f"Bearer {student_token}"}
        )
        student_id = me_resp.json()["id"]

        response = await async_client.delete(
            f"/classes/{class_id}/members/{student_id}",
            headers={"Authorization": f"Bearer {teacher_token}"},
        )

        assert response.status_code == 204

    async def test_student_cannot_remove_member(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher9@ex.com", password="secret")
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_r2@ex.com", password="secret")
        await create_user(async_session, org, role=UserRole.STUDENT, email="student_r3@ex.com", password="secret")
        teacher_token = await get_token(async_client, "teacher9@ex.com", "secret")
        s2_token = await get_token(async_client, "student_r2@ex.com", "secret")
        s3_token = await get_token(async_client, "student_r3@ex.com", "secret")

        create_resp = await async_client.post(
            "/classes",
            json={"name": "Remove Forbidden", "description": "d", "access_code": "REM002"},
            headers={"Authorization": f"Bearer {teacher_token}"},
        )
        class_id = create_resp.json()["id"]

        await async_client.post(
            f"/classes/{class_id}/join",
            json={"access_code": "REM002"},
            headers={"Authorization": f"Bearer {s2_token}"},
        )
        await async_client.post(
            f"/classes/{class_id}/join",
            json={"access_code": "REM002"},
            headers={"Authorization": f"Bearer {s3_token}"},
        )

        me_resp = await async_client.get("/auth/me", headers={"Authorization": f"Bearer {s2_token}"})
        s2_id = me_resp.json()["id"]

        response = await async_client.delete(
            f"/classes/{class_id}/members/{s2_id}",
            headers={"Authorization": f"Bearer {s3_token}"},
        )

        assert response.status_code == 403
