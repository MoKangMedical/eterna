"""Shared test fixtures for 念念 Eterna API tests."""
import os
import sys
import tempfile
from pathlib import Path

import pytest

# Ensure the project root is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


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
