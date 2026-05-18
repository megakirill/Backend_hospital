import { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

export default function AuthLayout({
    children,
}: Props) {

    return (
        <div
            className="
                relative
                flex
                min-h-screen
                items-center
                justify-center
                overflow-hidden
                bg-[#020817]
                px-4
            "
        >

            {/* BACKGROUND */}

            <div
                className="
                    absolute
                    inset-0
                    overflow-hidden
                "
            >

                <div
                    className="
                        absolute
                        left-[-150px]
                        top-[-150px]
                        h-[400px]
                        w-[400px]
                        rounded-full
                        bg-cyan-500/20
                        blur-3xl
                    "
                />

                <div
                    className="
                        absolute
                        bottom-[-150px]
                        right-[-150px]
                        h-[400px]
                        w-[400px]
                        rounded-full
                        bg-blue-600/20
                        blur-3xl
                    "
                />

            </div>

            {children}

        </div>
    );
}