"""Shared test fixtures for 念念 Eterna API tests."""
import os
import sys
import tempfile
from pathlib import Path

import pytest

# Ensure the project root is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


def _patch_httpx_testclient_compat():
    """Allow Starlette's TestClient to run with httpx versions that removed app=."""
    import inspect
    import httpx

    if "app" in inspect.signature(httpx.Client.__init__).parameters:
        return
    if getattr(httpx.Client.__init__, "_eterna_testclient_compat", False):
        return

    original_init = httpx.Client.__init__

    def compatible_init(self, *args, app=None, **kwargs):
        return original_init(self, *args, **kwargs)

    compatible_init._eterna_testclient_compat = True
    httpx.Client.__init__ = compatible_init


@pytest.fixture(autouse=True)
def _isolated_db(tmp_path, monkeypatch):
    """Use a temporary database for every test."""
    db_path = tmp_path / "test_eterna.db"
    monkeypatch.setenv("ETERNA_DB_PATH", str(db_path))
    monkeypatch.setenv("ETERNA_DISABLE_RATE_LIMIT", "1")
    yield


@pytest.fixture()
def client():
    """Provide a FastAPI TestClient with an isolated database."""
    _patch_httpx_testclient_compat()
    from fastapi.testclient import TestClient
    from api.app import app
    return TestClient(app)


@pytest.fixture()
def auth_headers(client):
    """Register a test user and return auth headers."""
    import uuid
    email = f"test-{uuid.uuid4().hex[:8]}@example.com"
    resp = client.post("/api/auth/register", json={
        "email": email,
        "password": "TestPass123!",
        "display_name": "Test User",
    })
    if resp.status_code == 200:
        token = resp.json().get("token", "")
        return {"Authorization": f"Bearer {token}"}
    return {}
