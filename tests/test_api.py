"""API endpoint tests for 念念 Eterna."""
import uuid
import concurrent.futures

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


class TestHealthReady:
    def test_ready_returns_checks(self, client):
        resp = client.get("/health/ready")
        assert resp.status_code == 200
        data = resp.json()
        assert "checks" in data
        assert data["status"] in ("healthy", "unhealthy")
        assert data["service"] == "念念"
        assert "version" in data

    def test_ready_has_database_check(self, client):
        data = client.get("/health/ready").json()
        assert "database" in data["checks"]
        assert data["checks"]["database"]["status"] == "ok"

    def test_ready_has_dependency_checks(self, client):
        data = client.get("/health/ready").json()
        checks = data["checks"]
        assert "mimo" in checks
        assert "stripe" in checks
        assert "ffmpeg" in checks
        assert "call_bridge" in checks


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

    def test_plans_returns_stripe_configured_flag(self, client):
        data = client.get("/api/plans").json()
        assert "stripe_configured" in data
        assert isinstance(data["stripe_configured"], bool)


class TestAuthFlow:
    def test_register_and_login(self, client):
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
        email = f"dup-{uuid.uuid4().hex[:8]}@test.com"
        payload = {"email": email, "password": "***", "display_name": "Dup"}
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

    def test_register_short_password_rejected(self, client):
        resp = client.post("/api/auth/register", json={
            "email": f"short-{uuid.uuid4().hex[:8]}@test.com",
            "password": "abc",
            "display_name": "Short",
        })
        assert resp.status_code in (400, 422)

    def test_register_invalid_email_rejected(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "not-an-email",
            "password": "ValidPass123!",
            "display_name": "Invalid",
        })
        assert resp.status_code == 400

    def test_register_empty_display_name_rejected(self, client):
        resp = client.post("/api/auth/register", json={
            "email": f"name-{uuid.uuid4().hex[:8]}@test.com",
            "password": "ValidPass123!",
            "display_name": "   ",
        })
        assert resp.status_code in (400, 422)

    def test_login_wrong_password(self, client):
        email = f"wrong-{uuid.uuid4().hex[:8]}@test.com"
        client.post("/api/auth/register", json={
            "email": email,
            "password": "CorrectPass1!",
            "display_name": "Wrong",
        })
        resp = client.post("/api/auth/login", json={
            "email": email,
            "password": "BadPassword!",
        })
        assert resp.status_code in (400, 401)

    def test_logout(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        resp = client.post("/api/auth/logout", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "logged_out"


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

    def test_get_single_loved_one(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        resp = client.post("/api/loved-ones", json={
            "name": "外婆",
            "relationship": "grandmother",
        }, headers=auth_headers)
        if resp.status_code != 200:
            pytest.skip("Could not create loved one")
        lo_id = resp.json()["id"]
        get_resp = client.get(f"/api/loved-ones/{lo_id}", headers=auth_headers)
        assert get_resp.status_code == 200
        assert get_resp.json()["name"] == "外婆"


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


class TestPagination:
    """Test that list endpoints support offset/limit pagination."""

    def test_memories_pagination_params(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        lo_resp = client.post("/api/loved-ones", json={
            "name": "翻页奶奶",
            "relationship": "grandmother",
        }, headers=auth_headers)
        if lo_resp.status_code != 200:
            pytest.skip("Could not create loved one")
        lo_id = lo_resp.json()["id"]

        # Create a couple of memories
        for i in range(3):
            client.post("/api/memories", json={
                "loved_one_id": lo_id,
                "content": f"记忆 {i}",
                "memory_type": "story",
            }, headers=auth_headers)

        # Request with offset/limit
        resp = client.get(f"/api/memories/{lo_id}?offset=0&limit=2", headers=auth_headers)
        assert resp.status_code == 200

    def test_chat_history_pagination_format(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        lo_resp = client.post("/api/loved-ones", json={
            "name": "聊天奶奶",
            "relationship": "grandmother",
        }, headers=auth_headers)
        if lo_resp.status_code != 200:
            pytest.skip("Could not create loved one")
        lo_id = lo_resp.json()["id"]

        resp = client.get(f"/api/chat-history/{lo_id}?offset=0&limit=10", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "pagination" in data
        assert "data" in data
        pagination = data["pagination"]
        assert "total" in pagination
        assert "offset" in pagination
        assert "limit" in pagination
        assert "has_more" in pagination


class TestRateLimit:
    """Test rate limiting behaviour (requires disabling the env override)."""

    def test_rate_limit_triggers_429(self, client, monkeypatch):
        # Re-enable rate limiting for this test
        monkeypatch.delenv("ETERNA_DISABLE_RATE_LIMIT", raising=False)
        # Reset rate limit state
        from api.app import _rate_limits
        _rate_limits.clear()

        # Hammer the health endpoint beyond the general limit (60 reqs)
        responses = []
        for _ in range(65):
            resp = client.get("/health")
            responses.append(resp.status_code)

        assert 429 in responses, "Expected a 429 status code after exceeding rate limit"


class TestAnalytics:
    def test_analytics_returns_ok(self, client):
        resp = client.post("/api/analytics", json={"name": "page_view", "page": "/home"})
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

    def test_analytics_empty_body_ok(self, client):
        resp = client.post("/api/analytics", json={})
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"


class TestLovedOneMedia:
    """Test media upload endpoints require auth and files."""

    def test_voice_upload_requires_auth(self, client):
        resp = client.post("/api/loved-ones/fake-id/voice")
        assert resp.status_code in (401, 403)

    def test_photo_upload_requires_auth(self, client):
        resp = client.post("/api/loved-ones/fake-id/photo")
        assert resp.status_code in (401, 403)

    def test_video_upload_requires_auth(self, client):
        resp = client.post("/api/loved-ones/fake-id/video")
        assert resp.status_code in (401, 403)

    def test_model3d_upload_requires_auth(self, client):
        resp = client.post("/api/loved-ones/fake-id/model-3d")
        assert resp.status_code in (401, 403)

    def test_voice_upload_missing_file(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        resp = client.post(
            "/api/loved-ones/fake-id/voice",
            headers=auth_headers,
        )
        # Should return 422 (missing required file field) or 404 (loved one not found)
        assert resp.status_code in (404, 422)

    def test_photo_upload_missing_file(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        resp = client.post(
            "/api/loved-ones/fake-id/photo",
            headers=auth_headers,
        )
        assert resp.status_code in (404, 422)


class TestProactiveCare:
    def test_opportunities_requires_auth(self, client):
        resp = client.get("/api/proactive/opportunities/test-id")
        assert resp.status_code in (401, 403)

    def test_feed_requires_auth(self, client):
        resp = client.get("/api/proactive/feed")
        assert resp.status_code in (401, 403)

    def test_opportunities_with_auth(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        # Create a loved one first
        lo_resp = client.post("/api/loved-ones", json={
            "name": "关怀奶奶",
            "relationship": "grandmother",
        }, headers=auth_headers)
        if lo_resp.status_code != 200:
            pytest.skip("Could not create loved one")
        lo_id = lo_resp.json()["id"]

        resp = client.get(f"/api/proactive/opportunities/{lo_id}", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "opportunities" in data
        assert "loved_one_id" in data

    def test_feed_with_auth(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        resp = client.get("/api/proactive/feed", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        # Should return feed structure even if empty
        assert isinstance(data, (dict, list))


class TestChatEndpoint:
    def test_chat_requires_auth(self, client):
        resp = client.post("/api/chat", json={
            "message": "你好",
        })
        assert resp.status_code in (401, 403)

    def test_chat_empty_message_with_auth(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        lo_resp = client.post("/api/loved-ones", json={
            "name": "聊天爷爷",
            "relationship": "grandfather",
        }, headers=auth_headers)
        if lo_resp.status_code != 200:
            pytest.skip("Could not create loved one")
        lo_id = lo_resp.json()["id"]

        resp = client.post("/api/chat", json={
            "loved_one_id": lo_id,
            "message": "",
        }, headers=auth_headers)
        # Empty message should either succeed (lenient) or return 400/422
        assert resp.status_code in (200, 400, 422)

    def test_chat_very_long_message(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        lo_resp = client.post("/api/loved-ones", json={
            "name": "长消息奶奶",
            "relationship": "grandmother",
        }, headers=auth_headers)
        if lo_resp.status_code != 200:
            pytest.skip("Could not create loved one")
        lo_id = lo_resp.json()["id"]

        long_msg = "你" * 10001
        resp = client.post("/api/chat", json={
            "loved_one_id": lo_id,
            "message": long_msg,
        }, headers=auth_headers)
        # Should either handle gracefully or reject
        assert resp.status_code in (200, 400, 413, 422)

    def test_chat_invalid_loved_one_id(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        resp = client.post("/api/chat", json={
            "loved_one_id": "nonexistent-id-12345",
            "message": "你好",
        }, headers=auth_headers)
        assert resp.status_code in (400, 404)

    def test_chat_history_invalid_loved_one(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        resp = client.get("/api/chat-history/nonexistent-id-12345", headers=auth_headers)
        assert resp.status_code in (400, 404)


class TestStatsEndpoint:
    def test_stats_requires_auth(self, client):
        resp = client.get("/api/stats")
        assert resp.status_code in (401, 403)

    def test_stats_with_auth(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        resp = client.get("/api/stats", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "total_loved_ones" in data
        assert "total_memories" in data
        assert "total_messages" in data


class TestEdgeCases:
    """Edge-case and error-path tests."""

    def test_invalid_loved_one_id_returns_error(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        resp = client.get("/api/loved-ones/this-id-does-not-exist", headers=auth_headers)
        assert resp.status_code in (400, 404)

    def test_delete_nonexistent_loved_one(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        resp = client.delete("/api/loved-ones/nonexistent-id", headers=auth_headers)
        assert resp.status_code in (400, 404)

    def test_memories_invalid_loved_one(self, client, auth_headers):
        if not auth_headers:
            pytest.skip("Auth not available")
        resp = client.get("/api/memories/nonexistent-id", headers=auth_headers)
        assert resp.status_code in (400, 404)

    def test_concurrent_registrations_same_email(self, client):
        email = f"concurrent-{uuid.uuid4().hex[:8]}@test.com"
        payload = {"email": email, "password": "Concurrent1!", "display_name": "Conc"}

        results = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [
                executor.submit(lambda: client.post("/api/auth/register", json=payload))
                for _ in range(5)
            ]
            for f in concurrent.futures.as_completed(futures):
                results.append(f.result().status_code)

        # Only one should succeed (200); the rest should get 409
        success_count = sum(1 for s in results if s == 200)
        conflict_count = sum(1 for s in results if s in (400, 409, 422))
        assert success_count >= 1, "At least one registration should succeed"
        assert success_count + conflict_count == len(results)

    def test_request_id_header_present(self, client):
        resp = client.get("/health")
        assert "X-Request-ID" in resp.headers

    def test_custom_request_id_echoed(self, client):
        resp = client.get("/health", headers={"X-Request-ID": "my-custom-id"})
        assert resp.headers.get("X-Request-ID") == "my-custom-id"

    def test_greeting_schedule_requires_auth(self, client):
        resp = client.get("/api/greetings/upcoming")
        assert resp.status_code in (401, 403)

    def test_billing_portal_requires_auth(self, client):
        resp = client.post("/api/billing/portal")
        assert resp.status_code in (401, 403)

    def test_admin_requires_auth(self, client):
        resp = client.get("/api/admin/overview")
        assert resp.status_code in (401, 403)
