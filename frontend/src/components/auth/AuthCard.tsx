import { ReactNode } from "react";

interface Props {
    title: string;
    subtitle: string;
    children: ReactNode;
}

export default function AuthCard({
    title,
    subtitle,
    children,
}: Props) {

    return (
        <div
            className="
                relative
                z-10
                w-full
                max-w-md
                rounded-3xl
                border
                border-white/10
                bg-white/5
                p-8
                shadow-2xl
                backdrop-blur-xl
            "
        >

            <div className="mb-8">

                <h1
                    className="
                        text-4xl
                        font-bold
                        tracking-tight
                        text-white
                    "
                >
                    {title}
                </h1>

                <p
                    className="
                        mt-2
                        text-sm
                        text-slate-400
                    "
                >
                    {subtitle}
                </p>

            </div>

            {children}

        </div>
    );
}