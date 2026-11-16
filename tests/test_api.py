import os
import shutil
import tempfile
import unittest
from io import BytesIO
from pathlib import Path

TEST_ROOT = Path(tempfile.mkdtemp(prefix="file-dashboard-tests-"))
os.environ["DATA_DIR"] = str(TEST_ROOT)
os.environ["UPLOAD_DIR"] = str(TEST_ROOT / "uploads")
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_ROOT / 'test.db'}"

from fastapi.testclient import TestClient
from openpyxl import Workbook

from app.main import app


class FileFlowTest(unittest.TestCase):
    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(TEST_ROOT, ignore_errors=True)

    def test_upload_import_and_dashboard_apis(self):
        with TestClient(app) as client:
            response = client.post(
                "/api/files/upload",
                files={
                    "file": (
                        "sales.csv",
                        "date,region,sales\n2026-11-16,华东,120\n2026-11-16,华南,80\n",
                        "text/csv",
                    )
                },
            )
            self.assertEqual(response.status_code, 201, response.text)
            self.assertEqual(response.json()["status"], "success")
            self.assertEqual(response.json()["total_records"], 2)

            records = client.get("/api/dashboard/records")
            self.assertEqual(records.status_code, 200)
            self.assertEqual(records.json()["total"], 2)
            self.assertEqual(records.json()["items"][0]["payload"]["region"], "华东")

            summary = client.get("/api/dashboard/summary")
            self.assertEqual(summary.status_code, 200)
            self.assertEqual(summary.json()["total_files"], 1)
            self.assertEqual(summary.json()["total_records"], 2)

            workbook = Workbook()
            sheet = workbook.active
            sheet.append(["date", "region", "sales"])
            sheet.append(["2026-11-16", "华北", 100])
            excel_file = BytesIO()
            workbook.save(excel_file)
            excel_file.seek(0)
            excel_response = client.post(
                "/api/files/upload",
                files={
                    "file": (
                        "sales.xlsx",
                        excel_file.getvalue(),
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    )
                },
            )
            self.assertEqual(excel_response.status_code, 201, excel_response.text)
            self.assertEqual(excel_response.json()["total_records"], 1)

            invalid = client.post(
                "/api/files/upload",
                files={"file": ("notes.txt", "not supported", "text/plain")},
            )
            self.assertEqual(invalid.status_code, 400)


if __name__ == "__main__":
    unittest.main()
