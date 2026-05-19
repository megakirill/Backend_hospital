import { useEffect, useState } from "react";

import axios from "axios";
import {
    ArrowLeft,
    ClipboardList,
    FileText,
    LogOut,
    Stethoscope,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { getMyPatientAppointments } from "../api/appointments";
import { getPatientMedicalRecord } from "../api/medicalRecords";
import { Appointment } from "../types/appointment";
import { MedicalRecord } from "../types/medicalRecord";
import { clearAccessToken } from "../utils/auth";

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function normalizeStatus(appointment: Appointment) {
    return String(appointment.status)
        .toLowerCase()
        .replace("_", " ");
}

function getStatusLabel(appointment: Appointment) {
    const status = normalizeStatus(appointment);

    if (status === "booked") {
        return "Записан";
    }

    if (status === "in progress") {
        return "На приеме";
    }

    if (status === "finished") {
        return "Завершен";
    }

    return "Свободен";
}

function getErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;

        if (typeof detail === "string") {
            return detail;
        }
    }

    return fallback;
}

export default function PatientAppointmentsPage() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedAppointmentId, setSelectedAppointmentId] =
        useState<number | null>(null);
    const [medicalRecord, setMedicalRecord] =
        useState<MedicalRecord | null>(null);
    const [loadingAppointments, setLoadingAppointments] =
        useState(true);
    const [loadingRecord, setLoadingRecord] = useState(false);
    const [error, setError] = useState("");
    const [recordMessage, setRecordMessage] = useState("");

    const selectedAppointment = appointments.find(
        (appointment) => appointment.id === selectedAppointmentId
    );

    useEffect(() => {
        async function loadAppointments() {
            try {
                setLoadingAppointments(true);
                setError("");

                const data = await getMyPatientAppointments();
                setAppointments(data);

                if (data.length > 0) {
                    setSelectedAppointmentId(data[0].id);
                }
            } catch (err) {
                setError(
                    getErrorMessage(
                        err,
                        "Не удалось загрузить ваши записи"
                    )
                );
            } finally {
                setLoadingAppointments(false);
            }
        }

        void loadAppointments();
    }, []);

    useEffect(() => {
        async function loadMedicalRecord() {
            if (!selectedAppointmentId) {
                setMedicalRecord(null);
                setRecordMessage("");
                return;
            }

            try {
                setLoadingRecord(true);
                setMedicalRecord(null);
                setRecordMessage("");

                setMedicalRecord(
                    await getPatientMedicalRecord(
                        selectedAppointmentId
                    )
                );
            } catch (err) {
                if (
                    axios.isAxiosError(err) &&
                    err.response?.status === 404
                ) {
                    setRecordMessage(
                        "Медицинская карта для этой записи пока не заполнена."
                    );
                    return;
                }

                setRecordMessage(
                    getErrorMessage(
                        err,
                        "Не удалось загрузить медицинскую карту"
                    )
                );
            } finally {
                setLoadingRecord(false);
            }
        }

        void loadMedicalRecord();
    }, [selectedAppointmentId]);

    const handleLogout = () => {
        clearAccessToken();
        navigate("/login");
    };

    return (
        <main className="min-h-screen bg-[#f7faf9] text-slate-950">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <div>
                        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">
                            <ClipboardList size={17} />
                            Личный кабинет пациента
                        </p>

                        <h1 className="mt-1 text-3xl font-bold">
                            Мои записи
                        </h1>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link
                            to="/doctors"
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                        >
                            <ArrowLeft size={18} />
                            К врачам
                        </Link>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                        >
                            <LogOut size={18} />
                            Выйти
                        </button>
                    </div>
                </div>
            </header>

            <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <h2 className="text-lg font-bold">
                            Записи на прием
                        </h2>
                    </div>

                    {error && (
                        <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {error}
                        </div>
                    )}

                    {loadingAppointments ? (
                        <p className="p-5 text-sm text-slate-500">
                            Загружаем записи...
                        </p>
                    ) : appointments.length === 0 ? (
                        <p className="p-5 text-sm text-slate-500">
                            У вас пока нет записей.
                        </p>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {appointments.map((appointment) => {
                                const selected =
                                    appointment.id ===
                                    selectedAppointmentId;

                                return (
                                    <button
                                        key={appointment.id}
                                        type="button"
                                        onClick={() =>
                                            setSelectedAppointmentId(
                                                appointment.id
                                            )
                                        }
                                        className={[
                                            "grid w-full gap-3 px-4 py-4 text-left transition hover:bg-slate-50 md:grid-cols-[190px_minmax(0,1fr)_120px]",
                                            selected
                                                ? "bg-emerald-50"
                                                : "bg-white",
                                        ].join(" ")}
                                    >
                                        <span className="font-semibold text-slate-900">
                                            {formatDateTime(
                                                appointment.appointment_time
                                            )}
                                        </span>

                                        <span className="flex items-center gap-2 text-sm text-slate-600">
                                            <Stethoscope size={17} />
                                            Врач #{appointment.doctor_id}
                                        </span>

                                        <span className="inline-flex h-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800">
                                            {getStatusLabel(appointment)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6 lg:self-start">
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                            <FileText size={21} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold">
                                Медицинская карта
                            </h2>
                            <p className="text-sm text-slate-500">
                                {selectedAppointment
                                    ? formatDateTime(
                                        selectedAppointment.appointment_time
                                    )
                                    : "Выберите запись"}
                            </p>
                        </div>
                    </div>

                    {!selectedAppointment && (
                        <p className="mt-5 text-sm leading-6 text-slate-500">
                            После выбора записи здесь появятся медицинские данные приема.
                        </p>
                    )}

                    {selectedAppointment && loadingRecord && (
                        <p className="mt-5 text-sm text-slate-500">
                            Загружаем медицинскую карту...
                        </p>
                    )}

                    {selectedAppointment &&
                        !loadingRecord &&
                        recordMessage && (
                            <p className="mt-5 text-sm leading-6 text-slate-500">
                                {recordMessage}
                            </p>
                        )}

                    {selectedAppointment &&
                        !loadingRecord &&
                        medicalRecord && (
                            <div className="mt-5 space-y-5">
                                <section>
                                    <p className="text-sm font-semibold text-slate-500">
                                        Диагноз
                                    </p>
                                    <p className="mt-1 whitespace-pre-line text-sm leading-6">
                                        {medicalRecord.diagnosis}
                                    </p>
                                </section>

                                <section>
                                    <p className="text-sm font-semibold text-slate-500">
                                        Симптомы
                                    </p>
                                    <p className="mt-1 whitespace-pre-line text-sm leading-6">
                                        {medicalRecord.symptoms}
                                    </p>
                                </section>

                                <section>
                                    <p className="text-sm font-semibold text-slate-500">
                                        Рекомендации
                                    </p>
                                    <p className="mt-1 whitespace-pre-line text-sm leading-6">
                                        {medicalRecord.recommendations}
                                    </p>
                                </section>
                            </div>
                        )}
                </aside>
            </section>
        </main>
    );
}
