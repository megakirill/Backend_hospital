import { useState } from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";

import { register } from "../api/auth";

export default function RegisterPage() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
        full_name: "",
        birth_date: "",
        phone: "",
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

    const handleSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        try {

            setLoading(true);

            setError("");

            await register(form);

            navigate("/dashboard");

        } catch (err: any) {

            setError(
                err.response?.data?.detail ||
                "Ошибка регистрации"
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <AuthLayout>

            <AuthCard
                title="Регистрация"
                subtitle="Создайте аккаунт пациента"
            >

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <AuthInput
                        placeholder="ФИО"
                        value={form.full_name}
                        onChange={handleChange}
                        name="full_name"
                    />

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