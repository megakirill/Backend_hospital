import { Link } from "react-router-dom";

export default function ForbiddenPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">
                    Доступ ограничен
                </p>

                <h1 className="mt-3 text-3xl font-bold text-slate-950">
                    Эта страница недоступна для вашей роли
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                    Войдите под подходящим аккаунтом, чтобы продолжить работу.
                </p>

                <Link
                    to="/login"
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                    Перейти ко входу
                </Link>
            </section>
        </main>
    );
}
