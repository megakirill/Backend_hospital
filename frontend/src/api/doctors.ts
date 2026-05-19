import api from "./axios";

import { Doctor } from "../types/doctor";

export async function getDoctors(
    specialization?: string
): Promise<Doctor[]> {
    const response = await api.get<Doctor[]>(
        "/doctors/",
        {
            params: specialization
                ? { specialization }
                : undefined,
        }
    );

    return response.data;
}
