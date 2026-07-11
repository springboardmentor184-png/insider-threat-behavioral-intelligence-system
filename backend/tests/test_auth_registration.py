import importlib
import os
import sys
import unittest
import uuid

from fastapi.testclient import TestClient


class AuthRegistrationFallbackTest(unittest.TestCase):
    def test_register_returns_201_when_postgres_is_unavailable(self):
        os.environ["DATABASE_URL"] = "postgresql://user:password@localhost/insidershield"
        os.environ["SECRET_KEY"] = "test-secret"

        for module_name in [
            "app.core.config",
            "app.database.session",
            "app.main",
        ]:
            sys.modules.pop(module_name, None)

        app_module = importlib.import_module("app.main")
        client = TestClient(app_module.app)

        suffix = uuid.uuid4().hex[:8]
        response = client.post(
            "/api/v1/auth/register",
            json={
                "employee_id": f"EMP{suffix}",
                "first_name": "Test",
                "last_name": "User",
                "email": f"test{suffix}@example.com",
                "password": "Test1234",
            },
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["message"], "Registration Success")


if __name__ == "__main__":
    unittest.main()
