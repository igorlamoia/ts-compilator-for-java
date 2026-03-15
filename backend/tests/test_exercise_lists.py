import os
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-testing-only-not-for-production")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.factories import (
    create_organization, create_user, create_class,
    create_exercise, create_exercise_list, create_class_exercise_list,
)
from app.models.user import UserRole
from app.models.exercise_list_item import ExerciseListItem
from app.models.submission import Submission


async def get_token(client: AsyncClient, email: str, password: str) -> str:
    r = await client.post("/auth/login", json={"email": email, "password": password})
    return r.json()["accessToken"]


class TestListExerciseLists:
    async def test_list_exercise_lists_empty(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_l1@ex.com", password="secret")
        token = await get_token(async_client, "teacher_el_l1@ex.com", "secret")

        response = await async_client.get(
            "/exercise-lists",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.json() == []

    async def test_list_exercise_lists_returns_own_lists(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_l2@ex.com", password="secret")
        other_teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_l3@ex.com", password="secret")
        token = await get_token(async_client, "teacher_el_l2@ex.com", "secret")

        await create_exercise_list(async_session, teacher, title="List A")
        await create_exercise_list(async_session, teacher, title="List B")
        await create_exercise_list(async_session, other_teacher, title="Other Teacher List")

        response = await async_client.get(
            "/exercise-lists",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        titles = {item["title"] for item in data}
        assert "List A" in titles
        assert "List B" in titles
        assert "Other Teacher List" not in titles


class TestCreateExerciseList:
    async def test_create_exercise_list(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_c1@ex.com", password="secret")
        token = await get_token(async_client, "teacher_el_c1@ex.com", "secret")

        response = await async_client.post(
            "/exercise-lists",
            json={"title": "My New List", "description": "A great list"},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "My New List"
        assert data["description"] == "A great list"
        assert data["teacherId"] == teacher.id
        assert data["items"] == []
        assert data["classes"] == []
        assert data["submittedExerciseIds"] == []


class TestGetExerciseList:
    async def test_get_exercise_list(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_g1@ex.com", password="secret")
        token = await get_token(async_client, "teacher_el_g1@ex.com", "secret")

        ex_list = await create_exercise_list(async_session, teacher, title="Detail List")
        exercise = await create_exercise(async_session, teacher, title="Exercise One")

        item = ExerciseListItem(
            exercise_list_id=ex_list.id,
            exercise_id=exercise.id,
            grade_weight=2.5,
            order_index=0,
        )
        async_session.add(item)
        await async_session.flush()

        response = await async_client.get(
            f"/exercise-lists/{ex_list.id}",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == ex_list.id
        assert data["title"] == "Detail List"
        assert len(data["items"]) == 1
        assert data["items"][0]["exerciseId"] == exercise.id
        assert data["items"][0]["gradeWeight"] == 2.5
        assert data["items"][0]["exercise"]["title"] == "Exercise One"

    async def test_get_exercise_list_not_found(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_g2@ex.com", password="secret")
        token = await get_token(async_client, "teacher_el_g2@ex.com", "secret")

        response = await async_client.get(
            "/exercise-lists/999999",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 404

    async def test_get_exercise_list_with_submitted_ids(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_g3@ex.com", password="secret")
        student = await create_user(async_session, org, role=UserRole.STUDENT, email="student_el_g1@ex.com", password="secret")
        student_token = await get_token(async_client, "student_el_g1@ex.com", "secret")

        cls = await create_class(async_session, org, teacher)
        exercise = await create_exercise(async_session, teacher)
        ex_list = await create_exercise_list(async_session, teacher)

        item = ExerciseListItem(
            exercise_list_id=ex_list.id,
            exercise_id=exercise.id,
            grade_weight=1.0,
            order_index=0,
        )
        async_session.add(item)
        await async_session.flush()

        await create_class_exercise_list(async_session, ex_list, cls)

        submission = Submission(
            exercise_id=exercise.id,
            exercise_list_id=ex_list.id,
            class_id=cls.id,
            student_id=student.id,
            code_snapshot="public void main() {}",
        )
        async_session.add(submission)
        await async_session.flush()

        response = await async_client.get(
            f"/exercise-lists/{ex_list.id}?classId={cls.id}",
            headers={"Authorization": f"Bearer {student_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert exercise.id in data["submittedExerciseIds"]

    async def test_get_exercise_list_without_class_id_has_empty_submitted(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_g4@ex.com", password="secret")
        token = await get_token(async_client, "teacher_el_g4@ex.com", "secret")

        ex_list = await create_exercise_list(async_session, teacher)

        response = await async_client.get(
            f"/exercise-lists/{ex_list.id}",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["submittedExerciseIds"] == []


class TestAddExerciseToList:
    async def test_add_exercise_to_list(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_a1@ex.com", password="secret")
        token = await get_token(async_client, "teacher_el_a1@ex.com", "secret")

        ex_list = await create_exercise_list(async_session, teacher)
        exercise = await create_exercise(async_session, teacher)

        response = await async_client.post(
            f"/exercise-lists/{ex_list.id}/exercises",
            json={"exerciseId": exercise.id, "gradeWeight": 3.0, "orderIndex": 1},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["exerciseId"] == exercise.id
        assert data["gradeWeight"] == 3.0
        assert data["orderIndex"] == 1

    async def test_add_exercise_forbidden_for_non_owner(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_a2@ex.com", password="secret")
        other_teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_a3@ex.com", password="secret")
        other_token = await get_token(async_client, "teacher_el_a3@ex.com", "secret")

        ex_list = await create_exercise_list(async_session, teacher)
        exercise = await create_exercise(async_session, teacher)

        response = await async_client.post(
            f"/exercise-lists/{ex_list.id}/exercises",
            json={"exerciseId": exercise.id, "gradeWeight": 1.0},
            headers={"Authorization": f"Bearer {other_token}"},
        )

        assert response.status_code == 403


class TestRemoveExerciseFromList:
    async def test_remove_exercise_from_list(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_r1@ex.com", password="secret")
        token = await get_token(async_client, "teacher_el_r1@ex.com", "secret")

        ex_list = await create_exercise_list(async_session, teacher)
        exercise = await create_exercise(async_session, teacher)

        item = ExerciseListItem(
            exercise_list_id=ex_list.id,
            exercise_id=exercise.id,
            grade_weight=1.0,
            order_index=0,
        )
        async_session.add(item)
        await async_session.flush()

        response = await async_client.delete(
            f"/exercise-lists/{ex_list.id}/exercises?exerciseId={exercise.id}",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 204

    async def test_remove_exercise_not_found(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_r2@ex.com", password="secret")
        token = await get_token(async_client, "teacher_el_r2@ex.com", "secret")

        ex_list = await create_exercise_list(async_session, teacher)

        response = await async_client.delete(
            f"/exercise-lists/{ex_list.id}/exercises?exerciseId=99999",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 404

    async def test_remove_exercise_forbidden_for_non_owner(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_r3@ex.com", password="secret")
        other_teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_r4@ex.com", password="secret")
        other_token = await get_token(async_client, "teacher_el_r4@ex.com", "secret")

        ex_list = await create_exercise_list(async_session, teacher)
        exercise = await create_exercise(async_session, teacher)

        item = ExerciseListItem(
            exercise_list_id=ex_list.id,
            exercise_id=exercise.id,
            grade_weight=1.0,
            order_index=0,
        )
        async_session.add(item)
        await async_session.flush()

        response = await async_client.delete(
            f"/exercise-lists/{ex_list.id}/exercises?exerciseId={exercise.id}",
            headers={"Authorization": f"Bearer {other_token}"},
        )

        assert response.status_code == 403


class TestPublishExerciseList:
    async def test_publish_exercise_list(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_p1@ex.com", password="secret")
        token = await get_token(async_client, "teacher_el_p1@ex.com", "secret")

        cls = await create_class(async_session, org, teacher)
        ex_list = await create_exercise_list(async_session, teacher)

        response = await async_client.post(
            f"/exercise-lists/{ex_list.id}/publish",
            json={
                "classId": cls.id,
                "totalGrade": 10.0,
                "minRequired": 6.0,
                "deadline": "2030-12-31T23:59:59",
            },
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["classId"] == cls.id
        assert data["exerciseListId"] == ex_list.id
        assert data["totalGrade"] == 10.0
        assert data["minRequired"] == 6.0
        assert "deadline" in data

    async def test_publish_exercise_list_updates_existing(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_p4@ex.com", password="secret")
        token = await get_token(async_client, "teacher_el_p4@ex.com", "secret")

        cls = await create_class(async_session, org, teacher)
        ex_list = await create_exercise_list(async_session, teacher)

        await async_client.post(
            f"/exercise-lists/{ex_list.id}/publish",
            json={
                "classId": cls.id,
                "totalGrade": 10.0,
                "minRequired": 6.0,
                "deadline": "2030-12-31T23:59:59",
            },
            headers={"Authorization": f"Bearer {token}"},
        )

        response = await async_client.post(
            f"/exercise-lists/{ex_list.id}/publish",
            json={
                "classId": cls.id,
                "totalGrade": 20.0,
                "minRequired": 12.0,
                "deadline": "2031-06-30T23:59:59",
            },
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["totalGrade"] == 20.0

    async def test_publish_forbidden_for_non_owner(
        self, async_client: AsyncClient, async_session: AsyncSession
    ):
        org = await create_organization(async_session)
        teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_p2@ex.com", password="secret")
        other_teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="teacher_el_p3@ex.com", password="secret")
        other_token = await get_token(async_client, "teacher_el_p3@ex.com", "secret")

        cls = await create_class(async_session, org, teacher)
        ex_list = await create_exercise_list(async_session, teacher)

        response = await async_client.post(
            f"/exercise-lists/{ex_list.id}/publish",
            json={
                "classId": cls.id,
                "totalGrade": 10.0,
                "minRequired": 6.0,
                "deadline": "2030-12-31T23:59:59",
            },
            headers={"Authorization": f"Bearer {other_token}"},
        )

        assert response.status_code == 403
