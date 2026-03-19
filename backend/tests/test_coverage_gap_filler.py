
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from tests.factories import create_organization, create_user, create_class
from app.models.user import UserRole
from app.core.security import create_access_token

@pytest.mark.asyncio
async def test_health_check(async_client: AsyncClient):
    response = await async_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

@pytest.mark.asyncio
async def test_invalid_token_format(async_client: AsyncClient):
    # Invalid JWT format (not 3 parts)
    response = await async_client.get("/auth/me", headers={"Authorization": "Bearer invalidtoken"})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_token_missing_sub(async_client: AsyncClient):
    # Token validly signed but missing 'sub' claim
    import jwt
    from app.core.config import settings
    token = jwt.encode({"some": "claim"}, settings.secret_key, algorithm="HS256")
    response = await async_client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_current_user_not_found(async_client: AsyncClient, async_session: AsyncSession):
    # Token for a user that doesn't exist in DB
    token = create_access_token("999999")
    response = await async_client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_create_class_duplicate_access_code(async_client: AsyncClient, async_session: AsyncSession):
    org = await create_organization(async_session)
    teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="t_gap@ex.com", password="pw")
    token = create_access_token(str(teacher.id))
    
    await async_client.post("/classes", json={"name": "C1", "description": "d", "access_code": "GAP1"}, headers={"Authorization": f"Bearer {token}"})
    response = await async_client.post("/classes", json={"name": "C2", "description": "d", "access_code": "GAP1"}, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 409

@pytest.mark.asyncio
async def test_remove_member_not_found(async_client: AsyncClient, async_session: AsyncSession):
    org = await create_organization(async_session)
    teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="t_gap2@ex.com", password="pw")
    cls = await create_class(async_session, org, teacher, access_code="GAP2")
    token = create_access_token(str(teacher.id))
    
    response = await async_client.delete(f"/classes/{cls.id}/members/999999", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_get_class_members_not_found(async_client: AsyncClient, async_session: AsyncSession):
    org = await create_organization(async_session)
    teacher = await create_user(async_session, org, role=UserRole.TEACHER, email="t_gap3@ex.com", password="pw")
    token = create_access_token(str(teacher.id))
    
    response = await async_client.get("/classes/999999/members", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_get_class_exercise_lists_not_found(async_client: AsyncClient, async_session: AsyncSession):
    org = await create_organization(async_session)
    student = await create_user(async_session, org, role=UserRole.STUDENT, email="s_gap1@ex.com", password="pw")
    token = create_access_token(str(student.id))
    
    response = await async_client.get("/classes/999999/exercise-lists", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404
