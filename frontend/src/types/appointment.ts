export type AppointmentStatus =
    | "free"
    | "booked"
    | "in progress"
    | "finished"
    | "FREE"
    | "BOOKED"
    | "IN_PROGRESS"
    | "FINISHED";

export interface Appointment {
    id: number;
    patient_id: number | null;
    doctor_id: number;
    appointment_time: string;
    status: AppointmentStatus;
}
