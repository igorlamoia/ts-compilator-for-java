
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from tests.factories import (
    create_organization, create_user, create_class, 
    create_exercise, create_exercise_list
)
from app.models.user import UserRole
from app.models.class_member import ClassMember
from app.models.test_case import TestCase
from app.core.security import create_access_token

@pytest.mark.asyncio
async def test_list_classes_as_student(async_client: AsyncClient, async_session: AsyncSession):
    org = await create_organization(async_session)
    teacher = await create_user(async_session, org, role=UserRole.TEACHER)
    student = await create_user(async_session, org, role=UserRole.STUDENT)
    cls = await create_class(async_session, org, teacher)
    
    # Enroll student
    member = ClassMember(class_id=cls.id, student_id=student.id)
    async_session.add(member)
    await async_session.flush()
    
    token = create_access_token(str(student.id))
    response = await async_client.get("/classes", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == cls.id

@pytest.mark.asyncio
async def test_get_exercise_list_unauthorized(async_client: AsyncClient, async_session: AsyncSession):
    org = await create_organization(async_session)
    teacher1 = await create_user(async_session, org, role=UserRole.TEACHER)
    teacher2 = await create_user(async_session, org, role=UserRole.TEACHER)
    el = await create_exercise_list(async_session, teacher1)
    
    # teacher2 tries to access teacher1's unpublished list
    token = create_access_token(str(teacher2.id))
    response = await async_client.get(f"/exercise-lists/{el.id}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
    assert response.json()["detail"] == "Not allowed"

@pytest.mark.asyncio
async def test_exercise_unauthorized_actions(async_client: AsyncClient, async_session: AsyncSession):
    org = await create_organization(async_session)
    teacher1 = await create_user(async_session, org, role=UserRole.TEACHER)
    teacher2 = await create_user(async_session, org, role=UserRole.TEACHER)
    ex = await create_exercise(async_session, teacher1)
    
    token = create_access_token(str(teacher2.id))
    
    # Update unauthorized
    response = await async_client.patch(f"/exercises/{ex.id}", json={"title": "new"}, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
    
    # Delete unauthorized
    response = await async_client.delete(f"/exercises/{ex.id}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
    
    # Add test case unauthorized
    response = await async_client.post(f"/exercises/{ex.id}/test-cases", json={"label": "L", "input": "I", "expected_output": "O", "order_index": 1}, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_delete_test_case_success_and_failures(async_client: AsyncClient, async_session: AsyncSession):
    org = await create_organization(async_session)
    teacher = await create_user(async_session, org, role=UserRole.TEACHER)
    teacher2 = await create_user(async_session, org, role=UserRole.TEACHER)
    ex = await create_exercise(async_session, teacher)
    
    tc = TestCase(exercise_id=ex.id, label="L", input="I", expected_output="O", order_index=1)
    async_session.add(tc)
    await async_session.flush()
    
    token = create_access_token(str(teacher.id))
    token2 = create_access_token(str(teacher2.id))
    
    # Delete unauthorized
    response = await async_client.delete(f"/exercises/{ex.id}/test-cases/{tc.id}", headers={"Authorization": f"Bearer {token2}"})
    assert response.status_code == 403
    
    # Delete not found
    response = await async_client.delete(f"/exercises/{ex.id}/test-cases/999999", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404
    
    # Delete success
    response = await async_client.delete(f"/exercises/{ex.id}/test-cases/{tc.id}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 204

@pytest.mark.asyncio
async def test_list_submissions_as_teacher(async_client: AsyncClient, async_session: AsyncSession):
    org = await create_organization(async_session)
    teacher = await create_user(async_session, org, role=UserRole.TEACHER)
    
    token = create_access_token(str(teacher.id))
    response = await async_client.get("/submissions", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)
