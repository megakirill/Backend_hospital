import api from "./axios";

import {
    MedicalRecord,
    MedicalRecordForm,
} from "../types/medicalRecord";

export async function getPatientMedicalRecord(
    appointmentId: number
): Promise<MedicalRecord> {
    const response = await api.get<MedicalRecord>(
        `/medical-records/by-appointment/${appointmentId}`
    );

    return response.data;
}

export async function getDoctorMedicalRecord(
    appointmentId: number
): Promise<MedicalRecord> {
    const response = await api.get<MedicalRecord>(
        `/medical-records/doctor/by-appointment/${appointmentId}`
    );

    return response.data;
}

export async function saveDoctorMedicalRecord(
    appointmentId: number,
    data: MedicalRecordForm
): Promise<MedicalRecord> {
    const response = await api.put<MedicalRecord>(
        `/medical-records/doctor/by-appointment/${appointmentId}`,
        data
    );

    return response.data;
}
