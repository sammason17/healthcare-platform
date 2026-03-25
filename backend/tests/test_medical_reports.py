import pytest
from tests.conftest import SAMPLE_PATIENT

SAMPLE_REPORT = {
    "blood_pressure": "120/80",
    "heart_rate": 72,
    "temperature": 37.0,
    "weight_kg": 70.5,
    "height_cm": 175.0,
    "notes": "Routine check-up, all normal.",
}


async def _create_patient(client, headers):
    resp = await client.post("/patients", json=SAMPLE_PATIENT, headers=headers)
    return resp.json()["id"]


async def test_create_medical_report_as_doctor(doctor_client):
    client, headers = doctor_client
    patient_id = await _create_patient(client, headers)

    resp = await client.post("/medical-reports", json={
        "patient_id": patient_id,
        **SAMPLE_REPORT,
    }, headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["blood_pressure"] == "120/80"
    assert data["heart_rate"] == 72
    assert data["patient_id"] == patient_id
    assert "recorded_at" in data


async def test_create_medical_report_as_pharmacist_forbidden(doctor_client, pharmacist_client):
    d_client, d_headers = doctor_client
    p_client, p_headers = pharmacist_client
    patient_id = await _create_patient(d_client, d_headers)

    resp = await p_client.post("/medical-reports", json={
        "patient_id": patient_id,
        **SAMPLE_REPORT,
    }, headers=p_headers)
    assert resp.status_code == 403


async def test_create_medical_report_unauthenticated(client):
    resp = await client.post("/medical-reports", json={"patient_id": "some-id"})
    assert resp.status_code == 401


async def test_medical_report_appears_on_patient_detail(doctor_client):
    client, headers = doctor_client
    patient_id = await _create_patient(client, headers)

    await client.post("/medical-reports", json={
        "patient_id": patient_id,
        **SAMPLE_REPORT,
    }, headers=headers)

    resp = await client.get(f"/patients/{patient_id}", headers=headers)
    assert resp.status_code == 200
    reports = resp.json()["medical_reports"]
    assert len(reports) == 1
    assert reports[0]["blood_pressure"] == "120/80"


async def test_create_report_with_partial_fields(doctor_client):
    client, headers = doctor_client
    patient_id = await _create_patient(client, headers)

    resp = await client.post("/medical-reports", json={
        "patient_id": patient_id,
        "notes": "Patient reported feeling unwell.",
    }, headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["notes"] == "Patient reported feeling unwell."
    assert data["heart_rate"] is None
