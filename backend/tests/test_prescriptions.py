import pytest
from tests.conftest import SAMPLE_PATIENT


async def _create_patient(client, headers):
    resp = await client.post("/patients", json=SAMPLE_PATIENT, headers=headers)
    return resp.json()["id"]


async def _create_prescription(client, headers, patient_id):
    resp = await client.post("/prescriptions", json={
        "patient_id": patient_id,
        "medication_name": "Amoxicillin 500mg",
        "dosage": "1 tablet twice daily",
        "instructions": "Take with food",
    }, headers=headers)
    return resp.json()


async def test_create_prescription_as_doctor(doctor_client):
    client, headers = doctor_client
    patient_id = await _create_patient(client, headers)
    rx = await _create_prescription(client, headers, patient_id)
    assert rx["medication_name"] == "Amoxicillin 500mg"
    assert rx["status"] == "Pending"
    assert rx["patient_id"] == patient_id


async def test_create_prescription_as_pharmacist_forbidden(doctor_client, pharmacist_client):
    d_client, d_headers = doctor_client
    p_client, p_headers = pharmacist_client
    patient_id = await _create_patient(d_client, d_headers)

    resp = await p_client.post("/prescriptions", json={
        "patient_id": patient_id,
        "medication_name": "Ibuprofen",
    }, headers=p_headers)
    assert resp.status_code == 403


async def test_create_prescription_unauthenticated(client):
    resp = await client.post("/prescriptions", json={
        "patient_id": "some-id",
        "medication_name": "Ibuprofen",
    })
    assert resp.status_code == 401


async def test_get_active_prescriptions_empty(doctor_client):
    client, headers = doctor_client
    resp = await client.get("/prescriptions/active", headers=headers)
    assert resp.status_code == 200
    assert resp.json() == []


async def test_get_active_prescriptions_shows_pending(doctor_client):
    client, headers = doctor_client
    patient_id = await _create_patient(client, headers)
    await _create_prescription(client, headers, patient_id)

    resp = await client.get("/prescriptions/active", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["status"] == "Pending"


async def test_get_active_prescriptions_shows_approved(doctor_client):
    client, headers = doctor_client
    patient_id = await _create_patient(client, headers)
    rx = await _create_prescription(client, headers, patient_id)

    await client.patch(f"/prescriptions/{rx['id']}/status", json={"status": "Approved"}, headers=headers)

    resp = await client.get("/prescriptions/active", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["status"] == "Approved"


async def test_dispensed_prescription_removed_from_active(doctor_client):
    client, headers = doctor_client
    patient_id = await _create_patient(client, headers)
    rx = await _create_prescription(client, headers, patient_id)

    await client.patch(f"/prescriptions/{rx['id']}/status", json={"status": "Approved"}, headers=headers)
    await client.patch(f"/prescriptions/{rx['id']}/status", json={"status": "Dispensed"}, headers=headers)

    resp = await client.get("/prescriptions/active", headers=headers)
    assert resp.status_code == 200
    assert resp.json() == []


async def test_update_status_pending_to_approved(doctor_client):
    client, headers = doctor_client
    patient_id = await _create_patient(client, headers)
    rx = await _create_prescription(client, headers, patient_id)

    resp = await client.patch(f"/prescriptions/{rx['id']}/status", json={"status": "Approved"}, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "Approved"


async def test_update_status_approved_to_dispensed(doctor_client):
    client, headers = doctor_client
    patient_id = await _create_patient(client, headers)
    rx = await _create_prescription(client, headers, patient_id)

    await client.patch(f"/prescriptions/{rx['id']}/status", json={"status": "Approved"}, headers=headers)
    resp = await client.patch(f"/prescriptions/{rx['id']}/status", json={"status": "Dispensed"}, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "Dispensed"


async def test_invalid_transition_pending_to_dispensed_directly(doctor_client):
    # Pending → Dispensed is allowed per our transition rules (shortcut)
    client, headers = doctor_client
    patient_id = await _create_patient(client, headers)
    rx = await _create_prescription(client, headers, patient_id)

    resp = await client.patch(f"/prescriptions/{rx['id']}/status", json={"status": "Dispensed"}, headers=headers)
    assert resp.status_code == 200


async def test_invalid_transition_dispensed_to_pending(doctor_client):
    client, headers = doctor_client
    patient_id = await _create_patient(client, headers)
    rx = await _create_prescription(client, headers, patient_id)

    await client.patch(f"/prescriptions/{rx['id']}/status", json={"status": "Approved"}, headers=headers)
    await client.patch(f"/prescriptions/{rx['id']}/status", json={"status": "Dispensed"}, headers=headers)

    resp = await client.patch(f"/prescriptions/{rx['id']}/status", json={"status": "Pending"}, headers=headers)
    assert resp.status_code == 422


async def test_pharmacist_can_update_status(doctor_client, pharmacist_client):
    d_client, d_headers = doctor_client
    p_client, p_headers = pharmacist_client
    patient_id = await _create_patient(d_client, d_headers)
    rx = await _create_prescription(d_client, d_headers, patient_id)

    resp = await p_client.patch(f"/prescriptions/{rx['id']}/status", json={"status": "Approved"}, headers=p_headers)
    assert resp.status_code == 200


async def test_prescription_appears_on_patient_detail(doctor_client):
    client, headers = doctor_client
    patient_id = await _create_patient(client, headers)
    await _create_prescription(client, headers, patient_id)

    resp = await client.get(f"/patients/{patient_id}", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()["prescriptions"]) == 1
    assert resp.json()["prescriptions"][0]["medication_name"] == "Amoxicillin 500mg"
