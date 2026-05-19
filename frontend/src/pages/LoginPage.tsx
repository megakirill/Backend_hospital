import { useState } from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";

import { login } from "../api/auth";
import {
    getCurrentUserRole,
    getHomePathByRole,
} from "../utils/auth";
import { getApiErrorMessage } from "../utils/errors";

export default function LoginPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
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

            await login(form);

            navigate(
                getHomePathByRole(getCurrentUserRole())
            );
        } catch (err) {
            setError(
                getApiErrorMessage(
                    err,
                    "Ошибка входа"
                )
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <AuthCard
                title="Вход"
                subtitle="Войдите в систему"
            >
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
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
                        {loading ? "Вход..." : "Войти"}
                    </button>

                    <p
                        className="
                            text-center
                            text-sm
                            text-slate-400
                        "
                    >
                        Нет аккаунта?{" "}

                        <Link
                            to="/register"
                            className="
                                text-cyan-300
                                hover:text-cyan-200
                            "
                        >
                            Регистрация
                        </Link>
                    </p>
                </form>
            </AuthCard>
        </AuthLayout>
    );
}
