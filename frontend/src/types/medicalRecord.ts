export interface MedicalRecord {
    id: number;
    appointment_id: number;
    diagnosis: string;
    symptoms: string;
    recommendations: string;
}

export interface MedicalRecordForm {
    diagnosis: string;
    symptoms: string;
    recommendations: string;
}
