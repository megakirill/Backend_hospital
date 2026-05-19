import axios from "axios";

interface ValidationError {
    loc?: Array<string | number>;
    msg?: string;
}

function formatDetail(detail: unknown) {
    if (typeof detail === "string") {
        return detail;
    }

    if (Array.isArray(detail)) {
        return detail
            .map((item) => {
                if (
                    typeof item === "object" &&
                    item !== null &&
                    "msg" in item
                ) {
                    const error = item as ValidationError;
                    const field = error.loc
                        ? error.loc[error.loc.length - 1]
                        : undefined;

                    return field
                        ? `${field}: ${error.msg}`
                        : error.msg;
                }

                return String(item);
            })
            .filter(Boolean)
            .join("; ");
    }

    if (detail && typeof detail === "object") {
        return JSON.stringify(detail);
    }

    return "";
}

export function getApiErrorMessage(
    error: unknown,
    fallback: string
) {
    if (axios.isAxiosError(error)) {
        const message = formatDetail(
            error.response?.data?.detail
        );

        return message || fallback;
    }

    return fallback;
}
