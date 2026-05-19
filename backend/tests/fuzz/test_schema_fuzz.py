from datetime import date, datetime

import pytest
from hypothesis import given, strategies as st
from pydantic import ValidationError

from backend.schemas.appointment import AppointmentCreate
from backend.schemas.auth import LoginSchema
from backend.schemas.doctor import DoctorCreate
from backend.schemas.medical_record import MedicalRecordCreate
from backend.schemas.patient import PatientCreate
from backend.schemas.user import UserCreate
from backend.storage.postgres import UserRole


text_field = st.text(
    alphabet=st.characters(
        blacklist_categories=("Cs",),
        blacklist_characters="\x00",
    ),
    min_size=1,
    max_size=120,
).filter(lambda value: bool(value.strip()))


@given(
    email=st.emails(),
    password=text_field,
    role=st.sampled_from(list(UserRole)),
)
def test_user_create_accepts_valid_fuzzed_payloads(email, password, role):
    user = UserCreate(
        email=email,
        password=password,
        role=role,
    )

    assert user.email == email
    assert user.password == password
    assert user.role == role


@given(
    email=st.text(max_size=80).filter(lambda value: "@" not in value),
    password=text_field,
)
def test_login_schema_rejects_invalid_email_shapes(email, password):
    with pytest.raises(ValidationError):
        LoginSchema(email=email, password=password)


@given(
    full_name=text_field,
    phone=text_field,
    user_id=st.integers(min_value=1, max_value=10**9),
    birth_date=st.dates(
        min_value=date(1900, 1, 1),
        max_value=date(2100, 12, 31),
    ),
)
def test_patient_create_accepts_fuzzed_profile_data(
    full_name,
    phone,
    user_id,
    birth_date,
):
    patient = PatientCreate(
        full_name=full_name,
        birth_date=birth_date,
        phone=phone,
        user_id=user_id,
    )

    assert patient.full_name == full_name
    assert patient.birth_date == birth_date
    assert patient.phone == phone
    assert patient.user_id == user_id


@given(
    full_name=text_field,
    specialization=text_field,
    cabinet=text_field,
    user_id=st.integers(min_value=1, max_value=10**9),
)
def test_doctor_create_accepts_fuzzed_profile_data(
    full_name,
    specialization,
    cabinet,
    user_id,
):
    doctor = DoctorCreate(
        full_name=full_name,
        specialization=specialization,
        cabinet=cabinet,
        user_id=user_id,
    )

    assert doctor.full_name == full_name
    assert doctor.specialization == specialization
    assert doctor.cabinet == cabinet
    assert doctor.user_id == user_id


@given(
    patient_id=st.integers(min_value=1, max_value=10**9),
    doctor_id=st.integers(min_value=1, max_value=10**9),
    appointment_time=st.datetimes(
        min_value=datetime(2020, 1, 1),
        max_value=datetime(2100, 1, 1),
    ),
)
def test_appointment_create_accepts_fuzzed_identifiers_and_time(
    patient_id,
    doctor_id,
    appointment_time,
):
    appointment = AppointmentCreate(
        patient_id=patient_id,
        doctor_id=doctor_id,
        appointment_time=appointment_time,
    )

    assert appointment.patient_id == patient_id
    assert appointment.doctor_id == doctor_id
    assert appointment.appointment_time == appointment_time


@given(
    diagnosis=text_field,
    symptoms=text_field,
    recommendations=text_field,
    appointment_id=st.integers(min_value=1, max_value=10**9),
)
def test_medical_record_create_accepts_fuzzed_text_fields(
    diagnosis,
    symptoms,
    recommendations,
    appointment_id,
):
    record = MedicalRecordCreate(
        diagnosis=diagnosis,
        symptoms=symptoms,
        recommendations=recommendations,
        appointment_id=appointment_id,
    )

    assert record.diagnosis == diagnosis
    assert record.symptoms == symptoms
    assert record.recommendations == recommendations
    assert record.appointment_id == appointment_id
