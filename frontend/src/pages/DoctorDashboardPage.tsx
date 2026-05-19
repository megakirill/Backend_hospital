import { useEffect, useMemo, useState } from "react";

import axios from "axios";
import {
    Calendar,
    CheckCircle2,
    Clock,
    DoorOpen,
    FileText,
    ListChecks,
    LogOut,
    Plus,
    Save,
    Stethoscope,
    UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
    createSlots,
    getMyDoctorAppointments,
    updateAppointmentStatus,
} from "../api/appointments";
import {
    getDoctorMedicalRecord,
    saveDoctorMedicalRecord,
} from "../api/medicalRecords";
import { Appointment } from "../types/appointment";
import {
    MedicalRecord,
    MedicalRecordForm,
} from "../types/medicalRecord";
import { clearAccessToken } from "../utils/auth";

const STATUS_OPTIONS = [
    { value: "booked", label: "Записан" },
    { value: "in progress", label: "На приеме" },
    { value: "finished", label: "Завершен" },
    { value: "free", label: "Свободен" },
];

function getTodayValue() {
    const today = new Date();
    const year = today.getFullYear();
    const month = `${today.getMonth() + 1}`.padStart(2, "0");
    const day = `${today.getDate()}`.padStart(2, "0");

    return `${year}-${month}-${day}`;
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

function normalizeStatus(slot: Appointment) {
    return String(slot.status)
        .toLowerCase()
        .replace("_", " ");
}

function getStatusLabel(slot: Appointment) {
    const status = normalizeStatus(slot);

    return STATUS_OPTIONS.find((option) => option.value === status)
        ?.label || status;
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function formatTime(value: string) {
    return new Intl.DateTimeFormat("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

export default function DoctorDashboardPage() {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(
        getTodayValue()
    );
    const [showAllDates, setShowAllDates] = useState(false);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedAppointmentId, setSelectedAppointmentId] =
        useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [creatingSlots, setCreatingSlots] = useState(false);
    const [changingStatus, setChangingStatus] = useState(false);
    const [loadingRecord, setLoadingRecord] = useState(false);
    const [savingRecord, setSavingRecord] = useState(false);
    const [medicalRecord, setMedicalRecord] =
        useState<MedicalRecord | null>(null);
    const [medicalRecordMessage, setMedicalRecordMessage] =
        useState("");
    const [medicalForm, setMedicalForm] =
        useState<MedicalRecordForm>({
            diagnosis: "",
            symptoms: "",
            recommendations: "",
        });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const selectedAppointment = appointments.find(
        (appointment) => appointment.id === selectedAppointmentId
    );

    const bookedCount = useMemo(
        () => appointments.filter(
            (appointment) =>
                normalizeStatus(appointment) !== "free" ||
                appointment.patient_id
        ).length,
        [appointments]
    );

    const freeCount = appointments.length - bookedCount;

    async function loadAppointments() {
        try {
            setLoading(true);
            setError("");
            const data = await getMyDoctorAppointments(
                showAllDates ? undefined : selectedDate
            );
            setAppointments(data);

            if (
                selectedAppointmentId &&
                !data.some(
                    (appointment) =>
                        appointment.id === selectedAppointmentId
                )
            ) {
                setSelectedAppointmentId(null);
            }
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Не удалось загрузить записи"
                )
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadAppointments();
    }, [selectedDate, showAllDates]);

    useEffect(() => {
        async function loadMedicalRecord() {
            if (!selectedAppointmentId) {
                setMedicalRecord(null);
                setMedicalRecordMessage("");
                setMedicalForm({
                    diagnosis: "",
                    symptoms: "",
                    recommendations: "",
                });
                return;
            }

            try {
                setLoadingRecord(true);
                setMedicalRecord(null);
                setMedicalRecordMessage("");

                const record = await getDoctorMedicalRecord(
                    selectedAppointmentId
                );
                setMedicalRecord(record);
                setMedicalForm({
                    diagnosis: record.diagnosis,
                    symptoms: record.symptoms,
                    recommendations: record.recommendations,
                });
            } catch (err) {
                setMedicalForm({
                    diagnosis: "",
                    symptoms: "",
                    recommendations: "",
                });

                if (
                    axios.isAxiosError(err) &&
                    err.response?.status === 404
                ) {
                    setMedicalRecordMessage(
                        "Медицинская карта для этой записи еще не заполнена."
                    );
                    return;
                }

                setMedicalRecordMessage(
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

    const handleCreateSlots = async () => {
        try {
            setCreatingSlots(true);
            setError("");
            setSuccess("");

            const slots = await createSlots(selectedDate);
            setSuccess(
                `Создано слотов: ${slots.length}`
            );
            setShowAllDates(false);
            setAppointments(
                await getMyDoctorAppointments(selectedDate)
            );
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Не удалось создать слоты на выбранную дату"
                )
            );
        } finally {
            setCreatingSlots(false);
        }
    };

    const handleStatusChange = async (status: string) => {
        if (!selectedAppointment) {
            return;
        }

        try {
            setChangingStatus(true);
            setError("");
            setSuccess("");

            const updatedAppointment = await updateAppointmentStatus(
                selectedAppointment.id,
                status
            );

            setAppointments((currentAppointments) =>
                currentAppointments.map((appointment) =>
                    appointment.id === updatedAppointment.id
                        ? updatedAppointment
                        : appointment
                )
            );
            setSuccess("Статус записи обновлен");
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Не удалось обновить статус записи"
                )
            );
        } finally {
            setChangingStatus(false);
        }
    };

    const handleMedicalFormChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setMedicalForm({
            ...medicalForm,
            [event.target.name]: event.target.value,
        });
    };

    const handleMedicalRecordSave = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        if (!selectedAppointment) {
            return;
        }

        try {
            setSavingRecord(true);
            setError("");
            setSuccess("");

            const record = await saveDoctorMedicalRecord(
                selectedAppointment.id,
                medicalForm
            );
            setMedicalRecord(record);
            setMedicalRecordMessage("");
            setSuccess("Медицинская карта сохранена");
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Не удалось сохранить медицинскую карту"
                )
            );
        } finally {
            setSavingRecord(false);
        }
    };

    const handleLogout = () => {
        clearAccessToken();
        navigate("/login");
    };

    const selectedAppointmentInProgress =
        selectedAppointment &&
        normalizeStatus(selectedAppointment) === "in progress";

    return (
        <main className="min-h-screen bg-[#f7faf9] text-slate-950">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <div>
                        <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">
                            <Stethoscope size={17} />
                            Кабинет врача
                        </p>

                        <h1 className="mt-1 text-3xl font-bold">
                            Записи и слоты
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                        <LogOut size={18} />
                        Выйти
                    </button>
                </div>
            </header>

            <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:px-8">
                <div className="space-y-5">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="grid gap-4 lg:grid-cols-[220px_auto_auto] lg:items-end">
                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Calendar size={17} />
                                    Дата для слотов
                                </span>

                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(event) =>
                                        setSelectedDate(
                                            event.target.value
                                        )
                                    }
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                />
                            </label>

                            <button
                                type="button"
                                onClick={handleCreateSlots}
                                disabled={creatingSlots}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                            >
                                <Plus size={18} />
                                {creatingSlots
                                    ? "Создаем..."
                                    : "Создать слоты"}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowAllDates((value) => !value)
                                }
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                            >
                                <ListChecks size={18} />
                                {showAllDates
                                    ? "Только дата"
                                    : "Все даты"}
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Всего слотов
                            </p>
                            <p className="mt-2 text-2xl font-bold">
                                {appointments.length}
                            </p>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Записей
                            </p>
                            <p className="mt-2 text-2xl font-bold text-emerald-700">
                                {bookedCount}
                            </p>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Свободно
                            </p>
                            <p className="mt-2 text-2xl font-bold text-slate-600">
                                {freeCount}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            <CheckCircle2 size={18} />
                            {success}
                        </div>
                    )}

                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                            <h2 className="text-lg font-bold">
                                {showAllDates
                                    ? "Все записи"
                                    : "Записи на дату"}
                            </h2>

                            <span className="text-sm text-slate-500">
                                {showAllDates
                                    ? "без фильтра"
                                    : selectedDate}
                            </span>
                        </div>

                        {loading ? (
                            <p className="p-5 text-sm text-slate-500">
                                Загружаем записи...
                            </p>
                        ) : appointments.length === 0 ? (
                            <p className="p-5 text-sm text-slate-500">
                                Записей и слотов пока нет.
                            </p>
                        ) : (
                            <div className="divide-y divide-slate-200">
                                {appointments.map((appointment) => {
                                    const selected =
                                        appointment.id ===
                                        selectedAppointmentId;
                                    const isFree =
                                        normalizeStatus(appointment) ===
                                            "free" &&
                                        !appointment.patient_id;

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
                                                "grid w-full gap-3 px-4 py-4 text-left transition hover:bg-slate-50 md:grid-cols-[150px_minmax(0,1fr)_130px]",
                                                selected
                                                    ? "bg-emerald-50"
                                                    : "bg-white",
                                            ].join(" ")}
                                        >
                                            <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                                <Clock size={17} />
                                                {formatDateTime(
                                                    appointment.appointment_time
                                                )}
                                            </span>

                                            <span className="flex items-center gap-2 text-sm text-slate-600">
                                                <UserRound size={17} />
                                                {isFree
                                                    ? "Свободный слот"
                                                    : `Пациент #${appointment.patient_id}`}
                                            </span>

                                            <span
                                                className={[
                                                    "inline-flex h-8 items-center justify-center rounded-lg border px-3 text-xs font-semibold",
                                                    isFree
                                                        ? "border-slate-200 bg-slate-100 text-slate-500"
                                                        : "border-emerald-200 bg-emerald-50 text-emerald-800",
                                                ].join(" ")}
                                            >
                                                {getStatusLabel(appointment)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6 lg:self-start">
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                            <DoorOpen size={21} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold">
                                Карточка записи
                            </h2>
                            <p className="text-sm text-slate-500">
                                Выберите запись из списка
                            </p>
                        </div>
                    </div>

                    {!selectedAppointment && (
                        <p className="mt-5 text-sm leading-6 text-slate-500">
                            Здесь появятся время приема, пациент и кнопки перевода статуса.
                        </p>
                    )}

                    {selectedAppointment && (
                        <div className="mt-5 space-y-5">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Время
                                </p>
                                <p className="mt-1 text-xl font-bold">
                                    {formatTime(
                                        selectedAppointment.appointment_time
                                    )}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {formatDateTime(
                                        selectedAppointment.appointment_time
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">
                                    Пациент
                                </p>
                                <p className="mt-1 font-semibold">
                                    {selectedAppointment.patient_id
                                        ? `Пациент #${selectedAppointment.patient_id}`
                                        : "Пациент не записан"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">
                                    Текущий статус
                                </p>
                                <p className="mt-1 font-semibold">
                                    {getStatusLabel(selectedAppointment)}
                                </p>
                            </div>

                            <div className="grid gap-2">
                                {STATUS_OPTIONS.map((status) => {
                                    const current =
                                        normalizeStatus(
                                            selectedAppointment
                                        ) === status.value;
                                    const disabled =
                                        changingStatus ||
                                        current ||
                                        (!selectedAppointment.patient_id &&
                                            normalizeStatus(
                                                selectedAppointment
                                            ) === "free");

                                    return (
                                        <button
                                            key={status.value}
                                            type="button"
                                            disabled={disabled}
                                            onClick={() =>
                                                handleStatusChange(
                                                    status.value
                                                )
                                            }
                                            className={[
                                                "h-10 rounded-lg border px-3 text-sm font-semibold transition",
                                                current
                                                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                                                    : "border-slate-300 bg-white text-slate-700 hover:border-emerald-500 hover:bg-emerald-50",
                                                disabled && !current
                                                    ? "opacity-50"
                                                    : "",
                                            ].join(" ")}
                                        >
                                            {status.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <form
                                onSubmit={handleMedicalRecordSave}
                                className="space-y-3 border-t border-slate-200 pt-5"
                            >
                                <div className="flex items-center gap-2">
                                    <FileText
                                        size={18}
                                        className="text-emerald-700"
                                    />
                                    <h3 className="font-bold">
                                        Медицинские данные
                                    </h3>
                                </div>

                                {!selectedAppointmentInProgress && (
                                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-5 text-amber-800">
                                        Заполнять карту можно только когда запись переведена в статус "На приеме".
                                    </p>
                                )}

                                {loadingRecord && (
                                    <p className="text-sm text-slate-500">
                                        Загружаем медицинскую карту...
                                    </p>
                                )}

                                {!loadingRecord &&
                                    medicalRecordMessage && (
                                        <p className="text-sm leading-5 text-slate-500">
                                            {medicalRecordMessage}
                                        </p>
                                    )}

                                {!loadingRecord && medicalRecord && (
                                    <p className="text-sm text-emerald-700">
                                        Карта уже создана, изменения обновят ее данные.
                                    </p>
                                )}

                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-slate-700">
                                        Диагноз
                                    </span>
                                    <textarea
                                        name="diagnosis"
                                        value={medicalForm.diagnosis}
                                        onChange={handleMedicalFormChange}
                                        disabled={
                                            !selectedAppointmentInProgress ||
                                            savingRecord
                                        }
                                        rows={3}
                                        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-500"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-slate-700">
                                        Симптомы
                                    </span>
                                    <textarea
                                        name="symptoms"
                                        value={medicalForm.symptoms}
                                        onChange={handleMedicalFormChange}
                                        disabled={
                                            !selectedAppointmentInProgress ||
                                            savingRecord
                                        }
                                        rows={3}
                                        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-500"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-slate-700">
                                        Рекомендации
                                    </span>
                                    <textarea
                                        name="recommendations"
                                        value={
                                            medicalForm.recommendations
                                        }
                                        onChange={handleMedicalFormChange}
                                        disabled={
                                            !selectedAppointmentInProgress ||
                                            savingRecord
                                        }
                                        rows={3}
                                        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-500"
                                    />
                                </label>

                                <button
                                    type="submit"
                                    disabled={
                                        !selectedAppointmentInProgress ||
                                        savingRecord
                                    }
                                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {savingRecord
                                        ? "Сохраняем..."
                                        : "Сохранить карту"}
                                </button>
                            </form>
                        </div>
                    )}
                </aside>
            </section>
        </main>
    );
}
