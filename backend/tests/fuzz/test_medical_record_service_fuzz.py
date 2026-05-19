import asyncio
from types import SimpleNamespace

from fastapi import HTTPException
import pytest
from hypothesis import assume, given, strategies as st

from backend.schemas.medical_record import MedicalRecordUpdate
from backend.services.medical_record import MedicalRecordService
from backend.storage.postgres import AppointmentStatus


text_field = st.text(
    alphabet=st.characters(
        blacklist_categories=("Cs",),
        blacklist_characters="\x00",
    ),
    min_size=1,
    max_size=180,
).filter(lambda value: bool(value.strip()))


class FakeAppointmentRepository:
    def __init__(self, appointment):
        self.appointment = appointment

    async def get_by_id(self, appointment_id):
        if appointment_id != self.appointment.id:
            return None

        return self.appointment


class FakeMedicalRecordRepository:
    def __init__(self, existing=None):
        self.existing = existing
        self.created = None
        self.updated = None

    async def get_by_appointment(self, appointment_id):
        if (
            self.existing is not None and
            self.existing.appointment_id == appointment_id
        ):
            return self.existing

        return None

    async def create(self, record):
        self.created = record
        return record

    async def update(self, record):
        self.updated = record
        return record


def build_service(appointment, existing=None):
    service = MedicalRecordService.__new__(MedicalRecordService)
    service.appointment_repo = FakeAppointmentRepository(appointment)
    service.repo = FakeMedicalRecordRepository(existing)
    return service


@given(
    appointment_id=st.integers(min_value=1, max_value=10**9),
    doctor_id=st.integers(min_value=1, max_value=10**9),
    patient_id=st.integers(min_value=1, max_value=10**9),
    diagnosis=text_field,
    symptoms=text_field,
    recommendations=text_field,
)
def test_doctor_can_create_medical_record_only_for_in_progress_appointment(
    appointment_id,
    doctor_id,
    patient_id,
    diagnosis,
    symptoms,
    recommendations,
):
    appointment = SimpleNamespace(
        id=appointment_id,
        doctor_id=doctor_id,
        patient_id=patient_id,
        status=AppointmentStatus.IN_PROGRESS,
    )
    service = build_service(appointment)
    data = MedicalRecordUpdate(
        diagnosis=diagnosis,
        symptoms=symptoms,
        recommendations=recommendations,
    )

    record = asyncio.run(
        service.upsert_for_doctor(
            appointment_id,
            doctor_id,
            data,
        )
    )

    assert record.appointment_id == appointment_id
    assert record.diagnosis == diagnosis
    assert record.symptoms == symptoms
    assert record.recommendations == recommendations


@given(
    appointment_id=st.integers(min_value=1, max_value=10**9),
    doctor_id=st.integers(min_value=1, max_value=10**9),
    other_doctor_id=st.integers(min_value=1, max_value=10**9),
    diagnosis=text_field,
)
def test_doctor_cannot_edit_another_doctors_appointment(
    appointment_id,
    doctor_id,
    other_doctor_id,
    diagnosis,
):
    assume(doctor_id != other_doctor_id)

    appointment = SimpleNamespace(
        id=appointment_id,
        doctor_id=doctor_id,
        patient_id=1,
        status=AppointmentStatus.IN_PROGRESS,
    )
    service = build_service(appointment)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(
            service.upsert_for_doctor(
                appointment_id,
                other_doctor_id,
                MedicalRecordUpdate(diagnosis=diagnosis),
            )
        )

    assert exc.value.status_code == 403


@given(
    appointment_id=st.integers(min_value=1, max_value=10**9),
    doctor_id=st.integers(min_value=1, max_value=10**9),
    status=st.sampled_from([
        AppointmentStatus.FREE,
        AppointmentStatus.BOOKED,
        AppointmentStatus.FINISHED,
    ]),
    diagnosis=text_field,
    symptoms=text_field,
    recommendations=text_field,
)
def test_doctor_cannot_create_medical_record_before_appointment_starts(
    appointment_id,
    doctor_id,
    status,
    diagnosis,
    symptoms,
    recommendations,
):
    appointment = SimpleNamespace(
        id=appointment_id,
        doctor_id=doctor_id,
        patient_id=1,
        status=status,
    )
    service = build_service(appointment)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(
            service.upsert_for_doctor(
                appointment_id,
                doctor_id,
                MedicalRecordUpdate(
                    diagnosis=diagnosis,
                    symptoms=symptoms,
                    recommendations=recommendations,
                ),
            )
        )

    assert exc.value.status_code == 400


@given(
    appointment_id=st.integers(min_value=1, max_value=10**9),
    doctor_id=st.integers(min_value=1, max_value=10**9),
    old_diagnosis=text_field,
    new_diagnosis=text_field,
)
def test_existing_medical_record_is_updated_without_losing_other_fields(
    appointment_id,
    doctor_id,
    old_diagnosis,
    new_diagnosis,
):
    appointment = SimpleNamespace(
        id=appointment_id,
        doctor_id=doctor_id,
        patient_id=1,
        status=AppointmentStatus.IN_PROGRESS,
    )
    existing = SimpleNamespace(
        id=1,
        appointment_id=appointment_id,
        diagnosis=old_diagnosis,
        symptoms="existing symptoms",
        recommendations="existing recommendations",
    )
    service = build_service(appointment, existing)

    record = asyncio.run(
        service.upsert_for_doctor(
            appointment_id,
            doctor_id,
            MedicalRecordUpdate(diagnosis=new_diagnosis),
        )
    )

    assert record.diagnosis == new_diagnosis
    assert record.symptoms == "existing symptoms"
    assert record.recommendations == "existing recommendations"
