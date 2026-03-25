import pytest
from tests.conftest import SAMPLE_PATIENT


async def test_create_patient_as_doctor(doctor_client):
    client, headers = doctor_client
    resp = await client.post("/patients", json=SAMPLE_PATIENT, headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["first_name"] == "Jane"
    assert data["last_name"] == "Smith"
    assert data["gender"] == "Female"
    assert "id" in data


async def test_create_patient_as_pharmacist_forbidden(pharmacist_client):
    client, headers = pharmacist_client
    resp = await client.post("/patients", json=SAMPLE_PATIENT, headers=headers)
    assert resp.status_code == 403


async def test_create_patient_unauthenticated(client):
    resp = await client.post("/patients", json=SAMPLE_PATIENT)
    assert resp.status_code == 401


async def test_create_patient_missing_required_fields(doctor_client):
    client, headers = doctor_client
    resp = await client.post("/patients", json={"first_name": "Only"}, headers=headers)
    assert resp.status_code == 422


async def test_list_patients_empty(doctor_client):
    client, headers = doctor_client
    resp = await client.get("/patients", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["items"] == []
    assert data["total"] == 0
    assert data["page"] == 1


async def test_list_patients_returns_created_patient(doctor_client):
    client, headers = doctor_client
    await client.post("/patients", json=SAMPLE_PATIENT, headers=headers)
    resp = await client.get("/patients", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["last_name"] == "Smith"


async def test_list_patients_pagination(doctor_client):
    client, headers = doctor_client
    for i in range(5):
        await client.post("/patients", json={
            **SAMPLE_PATIENT,
            "email": f"patient{i}@test.com",
            "last_name": f"Patient{i}",
        }, headers=headers)

    resp = await client.get("/patients?page=1&page_size=2", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 5
    assert len(data["items"]) == 2
    assert data["pages"] == 3


async def test_list_patients_filter_by_name(doctor_client):
    client, headers = doctor_client
    await client.post("/patients", json=SAMPLE_PATIENT, headers=headers)
    await client.post("/patients", json={**SAMPLE_PATIENT, "last_name": "Jones", "email": "jones@test.com"}, headers=headers)

    resp = await client.get("/patients?name=Smith", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["last_name"] == "Smith"


async def test_list_patients_filter_by_gender(doctor_client):
    client, headers = doctor_client
    await client.post("/patients", json=SAMPLE_PATIENT, headers=headers)
    await client.post("/patients", json={**SAMPLE_PATIENT, "gender": "Male", "email": "male@test.com"}, headers=headers)

    resp = await client.get("/patients?gender=Female", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["gender"] == "Female"


async def test_get_patient_detail(doctor_client):
    client, headers = doctor_client
    create_resp = await client.post("/patients", json=SAMPLE_PATIENT, headers=headers)
    patient_id = create_resp.json()["id"]

    resp = await client.get(f"/patients/{patient_id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == patient_id
    assert data["prescriptions"] == []
    assert data["medical_reports"] == []


async def test_get_patient_not_found(doctor_client):
    client, headers = doctor_client
    resp = await client.get("/patients/nonexistent-id", headers=headers)
    assert resp.status_code == 404


async def test_update_patient(doctor_client):
    client, headers = doctor_client
    create_resp = await client.post("/patients", json=SAMPLE_PATIENT, headers=headers)
    patient_id = create_resp.json()["id"]

    resp = await client.put(f"/patients/{patient_id}", json={"first_name": "Updated"}, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["first_name"] == "Updated"


async def test_update_patient_as_pharmacist_forbidden(doctor_client, pharmacist_client):
    d_client, d_headers = doctor_client
    p_client, p_headers = pharmacist_client
    create_resp = await d_client.post("/patients", json=SAMPLE_PATIENT, headers=d_headers)
    patient_id = create_resp.json()["id"]

    resp = await p_client.put(f"/patients/{patient_id}", json={"first_name": "Hacked"}, headers=p_headers)
    assert resp.status_code == 403
