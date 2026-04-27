"""API endpoint tests for 念念 Eterna."""
import pytest


class TestHealthEndpoint:
    def test_health_returns_ok(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert data["service"] == "念念"
        assert "version" in data
        assert "timestamp" in data

    def test_health_shows_config_status(self, client):
        data = client.get("/health").json()
        assert "mimo_configured" in data
        assert "stripe_configured" in data
        assert "ffmpeg_configured" in data


class TestIndexEndpoint:
    def test_index_returns_html(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        assert "text/html" in resp.headers.get("content-type", "")


class TestPlansEndpoint:
    def test_plans_returns_list(self, client):
        resp = client.get("/api/plans")
        assert resp.status_code == 200
        data = resp.json()
        assert "plans" in data
        assert isinstance(data["plans"], list)

    def test_plans_have_required_fields(self, client):
        plans = client.get("/api/plans").json()["plans"]
        if plans:
            plan = plans[0]
            assert "code" in plan
            assert "price_cny" in plan


class TestAuthFlow:
    def test_register_and_login(self, client):
        import uuid
        email = f"flow-{uuid.uuid4().hex[:8]}@test.com"
        password = "SecurePass123!"

        # Register
        resp = client.post("/api/auth/register", json={
            "email": email,
            "password": password,
            "display_name": "Flow Test",
        })
        assert resp.status_code == 200
        reg_data = resp.json()
        assert "token" in reg_data
        assert reg_data["user"]["email"] == email

        # Login
        resp = client.post("/api/auth/login", json={
            "email": email,
            "password": password,
        })
        assert resp.status_code == 200
        assert "token" in resp.json()

    def test_register_duplicate_email(self, client):
        import uuid
        email = f"dup-{uuid.uuid4().hex[:8]}@test.com"
        payload = {"email": email, "password": "Pass123!", "display_name": "Dup"}
        client.post("/api/auth/register", json=payload)
        resp = client.post("/api/auth/register", json=payload)
        assert resp.status_code in (400, 409, 422)

    def test_me_requires_auth(self, client):
        resp = client.get("/api/auth/me")
        assert resp.status_code in (401, 403)

    def test_me_returns_user(self, client, auth_headers):
        if auth_headers:
            resp = client.get("/api/auth/me", headers=auth_headers)
            assert resp.status_code == 200


class TestLovedOnes:
    def test_create_loved_one(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        resp = client.post("/api/loved-ones", json={
            "name": "奶奶",
            "relationship": "grandmother",
        }, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "奶奶"

    def test_list_loved_ones(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        resp = client.get("/api/loved-ones", headers=auth_headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_create_and_delete(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        resp = client.post("/api/loved-ones", json={
            "name": "爷爷",
            "relationship": "grandfather",
        }, headers=auth_headers)
        if resp.status_code == 200:
            lo_id = resp.json()["id"]
            del_resp = client.delete(f"/api/loved-ones/{lo_id}", headers=auth_headers)
            assert del_resp.status_code == 200


class TestMemories:
    def test_create_memory(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        # First create a loved one
        lo_resp = client.post("/api/loved-ones", json={
            "name": "外婆",
            "relationship": "grandmother",
        }, headers=auth_headers)
        if lo_resp.status_code != 200:
            pytest.skip("Could not create loved one")
        lo_id = lo_resp.json()["id"]

        resp = client.post("/api/memories", json={
            "loved_one_id": lo_id,
            "content": "外婆总是给我做红烧肉",
            "memory_type": "story",
        }, headers=auth_headers)
        assert resp.status_code == 200

    def test_list_memories(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        lo_resp = client.post("/api/loved-ones", json={
            "name": "外公",
            "relationship": "grandfather",
        }, headers=auth_headers)
        if lo_resp.status_code != 200:
            pytest.skip("Could not create loved one")
        lo_id = lo_resp.json()["id"]

        resp = client.get(f"/api/memories/{lo_id}", headers=auth_headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


class TestChatEndpoint:
    def test_chat_requires_auth(self, client):
        resp = client.post("/api/chat", json={
            "message": "你好",
        })
        assert resp.status_code in (401, 403)


class TestStatsEndpoint:
    def test_stats_requires_auth(self, client):
        resp = client.get("/api/stats")
        assert resp.status_code in (401, 403)


class TestProactiveCare:
    def test_opportunities_requires_auth(self, client):
        resp = client.get("/api/proactive/opportunities/test-id")
        assert resp.status_code in (401, 403)

    def test_feed_requires_auth(self, client):
        resp = client.get("/api/proactive/feed")
        assert resp.status_code in (401, 403)
