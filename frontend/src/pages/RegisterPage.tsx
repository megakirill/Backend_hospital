import { useState } from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";

import { register } from "../api/auth";
import { UserRole } from "../types/auth";
import {
    getCurrentUserRole,
    getHomePathByRole,
} from "../utils/auth";
import { getApiErrorMessage } from "../utils/errors";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
        role: "patient" as UserRole,
        full_name: "",
        birth_date: "",
        phone: "",
        specialization: "",
        cabinet: "",
    });

    const [loading, setLoading] =
        useState(false);

    const [error, setError] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleRoleChange = (
        role: UserRole
    ) => {
        setForm({
            ...form,
            role,
        });
    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!form.full_name.trim()) {
            setError("Укажите ФИО");
            return;
        }

        if (form.role === "patient") {
            if (!form.birth_date) {
                setError("Укажите дату рождения");
                return;
            }

            if (!form.phone.trim()) {
                setError("Укажите телефон");
                return;
            }
        }

        if (form.role === "doctor") {
            if (!form.specialization.trim()) {
                setError("Укажите специальность");
                return;
            }

            if (!form.cabinet.trim()) {
                setError("Укажите кабинет");
                return;
            }
        }

        try {
            setLoading(true);
            setError("");

            await register(form);

            navigate(
                getHomePathByRole(getCurrentUserRole())
            );
        } catch (err) {
            setError(
                getApiErrorMessage(
                    err,
                    "Ошибка регистрации"
                )
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <AuthCard
                title="Регистрация"
                subtitle="Создайте аккаунт пациента или врача"
            >
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                handleRoleChange("patient")
                            }
                            className={[
                                "h-11 rounded-2xl border text-sm font-semibold transition",
                                form.role === "patient"
                                    ? "border-cyan-300 bg-cyan-400 text-slate-950"
                                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
                            ].join(" ")}
                        >
                            Пациент
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                handleRoleChange("doctor")
                            }
                            className={[
                                "h-11 rounded-2xl border text-sm font-semibold transition",
                                form.role === "doctor"
                                    ? "border-cyan-300 bg-cyan-400 text-slate-950"
                                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
                            ].join(" ")}
                        >
                            Врач
                        </button>
                    </div>

                    <AuthInput
                        placeholder="ФИО"
                        value={form.full_name}
                        onChange={handleChange}
                        name="full_name"
                    />

                    {form.role === "patient" ? (
                        <>
                            <AuthInput
                                type="date"
                                placeholder=""
                                value={form.birth_date}
                                onChange={handleChange}
                                name="birth_date"
                            />

                            <AuthInput
                                placeholder="Телефон"
                                value={form.phone}
                                onChange={handleChange}
                                name="phone"
                            />
                        </>
                    ) : (
                        <>
                            <AuthInput
                                placeholder="Специальность"
                                value={form.specialization}
                                onChange={handleChange}
                                name="specialization"
                            />

                            <AuthInput
                                placeholder="Кабинет"
                                value={form.cabinet}
                                onChange={handleChange}
                                name="cabinet"
                            />
                        </>
                    )}

                    <AuthInput
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        name="email"
                    />

                    <AuthInput
                        type="password"
                        placeholder="Пароль"
                        value={form.password}
                        onChange={handleChange}
                        name="password"
                    />

                    {error && (
                        <div
                            className="
                                rounded-2xl
                                border
                                border-red-500/20
                                bg-red-500/10
                                p-4
                                text-sm
                                text-red-200
                            "
                        >
                            {error}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        className="
                            h-14
                            w-full
                            rounded-2xl
                            bg-cyan-500
                            font-semibold
                            text-slate-950
                            transition-all
                            hover:bg-cyan-400
                            disabled:opacity-50
                        "
                    >
                        {
                            loading
                                ? "Создание..."
                                : "Создать аккаунт"
                        }
                    </button>

                    <p
                        className="
                            text-center
                            text-sm
                            text-slate-400
                        "
                    >
                        Уже есть аккаунт?{" "}

                        <Link
                            to="/login"
                            className="
                                text-cyan-300
                                hover:text-cyan-200
                            "
                        >
                            Войти
                        </Link>
                    </p>
                </form>
            </AuthCard>
        </AuthLayout>
    );
}
