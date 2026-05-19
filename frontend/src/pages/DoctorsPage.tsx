import { useEffect, useMemo, useState } from "react";

import axios from "axios";
import {
    Calendar,
    CheckCircle2,
    ClipboardList,
    Clock,
    DoorOpen,
    Filter,
    LogOut,
    Stethoscope,
    UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { getDoctorSlots, takeSlot } from "../api/appointments";
import { getDoctors } from "../api/doctors";
import { Appointment } from "../types/appointment";
import { Doctor } from "../types/doctor";
import { clearAccessToken } from "../utils/auth";

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

function formatSlotTime(value: string) {
    return new Intl.DateTimeFormat("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function normalizeStatus(slot: Appointment) {
    return String(slot.status)
        .toLowerCase()
        .replace("_", " ");
}

function isFreeSlot(slot: Appointment) {
    return normalizeStatus(slot) === "free" && !slot.patient_id;
}

export default function DoctorsPage() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedSpecialization, setSelectedSpecialization] =
        useState("");
    const [selectedDate, setSelectedDate] = useState(
        getTodayValue()
    );
    const [selectedDoctorId, setSelectedDoctorId] =
        useState<number | null>(null);
    const [slots, setSlots] = useState<Appointment[]>([]);
    const [loadingDoctors, setLoadingDoctors] =
        useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [bookingSlotId, setBookingSlotId] =
        useState<number | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        async function loadDoctors() {
            try {
                setLoadingDoctors(true);
                setError("");
                setDoctors(await getDoctors());
            } catch (err) {
                setError(
                    getErrorMessage(
                        err,
                        "Не удалось загрузить врачей"
                    )
                );
            } finally {
                setLoadingDoctors(false);
            }
        }

        void loadDoctors();
    }, []);

    useEffect(() => {
        async function loadSlots() {
            if (!selectedDoctorId) {
                setSlots([]);
                return;
            }

            try {
                setLoadingSlots(true);
                setError("");
                setSuccess("");
                setSlots(
                    await getDoctorSlots(
                        selectedDoctorId,
                        selectedDate
                    )
                );
            } catch (err) {
                setSlots([]);
                setError(
                    getErrorMessage(
                        err,
                        "Не удалось загрузить слоты врача"
                    )
                );
            } finally {
                setLoadingSlots(false);
            }
        }

        void loadSlots();
    }, [selectedDoctorId, selectedDate]);

    const specializations = useMemo(
        () => Array.from(
            new Set(
                doctors.map((doctor) => doctor.specialization)
            )
        ).sort((a, b) => a.localeCompare(b, "ru")),
        [doctors]
    );

    const visibleDoctors = useMemo(
        () => selectedSpecialization
            ? doctors.filter(
                (doctor) =>
                    doctor.specialization ===
                    selectedSpecialization
            )
            : doctors,
        [doctors, selectedSpecialization]
    );

    const selectedDoctor = doctors.find(
        (doctor) => doctor.id === selectedDoctorId
    );

    const handleLogout = () => {
        clearAccessToken();
        navigate("/login");
    };

    const handleBookSlot = async (slot: Appointment) => {
        try {
            setBookingSlotId(slot.id);
            setError("");
            setSuccess("");

            const bookedSlot = await takeSlot(slot.id);

            setSlots((currentSlots) =>
                currentSlots.map((currentSlot) =>
                    currentSlot.id === bookedSlot.id
                        ? bookedSlot
                        : currentSlot
                )
            );
            setSuccess(
                `Вы записаны на ${formatSlotTime(slot.appointment_time)}`
            );
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Не удалось записаться на выбранное время"
                )
            );
        } finally {
            setBookingSlotId(null);
        }
    };

    return (
        <main className="min-h-screen bg-[#f7faf9] text-slate-950">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                            Запись на прием
                        </p>

                        <h1 className="mt-1 text-3xl font-bold">
                            Выбор врача
                        </h1>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Link
                            to="/my-appointments"
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            <ClipboardList size={18} />
                            Мои записи
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

            <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
                <div className="space-y-5">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Filter size={17} />
                                    Специальность
                                </span>

                                <select
                                    value={selectedSpecialization}
                                    onChange={(event) => {
                                        setSelectedSpecialization(
                                            event.target.value
                                        );
                                        setSelectedDoctorId(null);
                                    }}
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                >
                                    <option value="">
                                        Все специальности
                                    </option>

                                    {specializations.map(
                                        (specialization) => (
                                            <option
                                                key={specialization}
                                                value={specialization}
                                            >
                                                {specialization}
                                            </option>
                                        )
                                    )}
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Calendar size={17} />
                                    Дата
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

                    {loadingDoctors ? (
                        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                            Загружаем врачей...
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {visibleDoctors.map((doctor) => {
                                const isSelected =
                                    doctor.id === selectedDoctorId;

                                return (
                                    <button
                                        key={doctor.id}
                                        type="button"
                                        onClick={() =>
                                            setSelectedDoctorId(
                                                doctor.id
                                            )
                                        }
                                        className={[
                                            "rounded-lg border bg-white p-5 text-left shadow-sm transition",
                                            "hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md",
                                            isSelected
                                                ? "border-emerald-500 ring-2 ring-emerald-100"
                                                : "border-slate-200",
                                        ].join(" ")}
                                        aria-pressed={isSelected}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                                <UserRound size={24} />
                                            </div>

                                            <div className="min-w-0">
                                                <h2 className="text-lg font-bold text-slate-950">
                                                    {doctor.full_name}
                                                </h2>

                                                <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                                                    <Stethoscope size={16} />
                                                    {doctor.specialization}
                                                </p>

                                                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                                                    <DoorOpen size={16} />
                                                    Кабинет {doctor.cabinet}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {!loadingDoctors && visibleDoctors.length === 0 && (
                        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                            Врачи по выбранной специальности не найдены.
                        </div>
                    )}
                </div>

                <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6 lg:self-start">
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                            <Clock size={21} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold">
                                Доступное время
                            </h2>

                            <p className="text-sm text-slate-500">
                                {selectedDoctor
                                    ? selectedDoctor.full_name
                                    : "Выберите карточку врача"}
                            </p>
                        </div>
                    </div>

                    {!selectedDoctorId && (
                        <p className="mt-5 text-sm leading-6 text-slate-500">
                            После выбора врача здесь появятся свободные слоты для записи на выбранную дату.
                        </p>
                    )}

                    {selectedDoctorId && loadingSlots && (
                        <p className="mt-5 text-sm text-slate-500">
                            Загружаем слоты...
                        </p>
                    )}

                    {selectedDoctorId &&
                        !loadingSlots &&
                        slots.length === 0 && (
                            <p className="mt-5 text-sm leading-6 text-slate-500">
                                На эту дату слотов пока нет.
                            </p>
                        )}

                    {selectedDoctorId &&
                        !loadingSlots &&
                        slots.length > 0 && (
                            <div className="mt-5 grid grid-cols-2 gap-2">
                                {slots.map((slot) => {
                                    const free = isFreeSlot(slot);
                                    const isBooking =
                                        bookingSlotId === slot.id;

                                    return (
                                        <button
                                            key={slot.id}
                                            type="button"
                                            disabled={!free || isBooking}
                                            onClick={() =>
                                                handleBookSlot(slot)
                                            }
                                            className={[
                                                "h-11 rounded-lg border px-3 text-sm font-semibold transition",
                                                free
                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-500 hover:bg-emerald-100"
                                                    : "border-slate-200 bg-slate-100 text-slate-400",
                                                isBooking
                                                    ? "opacity-70"
                                                    : "",
                                            ].join(" ")}
                                        >
                                            {isBooking
                                                ? "Запись..."
                                                : formatSlotTime(
                                                    slot.appointment_time
                                                )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                </aside>
            </section>
        </main>
    );
}
