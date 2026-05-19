import api from "./axios";

import { Appointment } from "../types/appointment";

export async function getDoctorSlots(
    doctorId: number,
    date: string
): Promise<Appointment[]> {
    const response = await api.get<Appointment[]>(
        `/appointments/by_doctor_id/${doctorId}`,
        {
            params: { date },
        }
    );

    return response.data;
}

export async function takeSlot(
    appointmentId: number
): Promise<Appointment> {
    const response = await api.patch<Appointment>(
        `/appointments/take_slot/${appointmentId}`
    );

    return response.data;
}

export async function createSlots(
    date: string
): Promise<Appointment[]> {
    const response = await api.post<Appointment[]>(
        "/appointments/create_slots",
        null,
        {
            params: { data: date },
        }
    );

    return response.data;
}

export async function getMyDoctorAppointments(
    date?: string
): Promise<Appointment[]> {
    const response = await api.get<Appointment[]>(
        "/appointments/my",
        {
            params: date ? { date } : undefined,
        }
    );

    return response.data;
}

export async function getMyPatientAppointments(): Promise<Appointment[]> {
    const response = await api.get<Appointment[]>(
        "/appointments/my-patient"
    );

    return response.data;
}

export async function updateAppointmentStatus(
    appointmentId: number,
    status: string
): Promise<Appointment> {
    const response = await api.patch<Appointment>(
        `/appointments/${appointmentId}/status`,
        null,
        {
            params: { status },
        }
    );

    return response.data;
}
