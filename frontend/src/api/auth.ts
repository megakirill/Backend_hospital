import api from "./axios";

import {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
} from "../types/auth";

export async function login(
    data: LoginRequest
): Promise<AuthResponse> {
    const response = await api.post(
        "/auth/login",
        data
    );

    localStorage.setItem(
        "access_token",
        response.data.access_token
    );

    return response.data;
}

export async function register(
    data: RegisterRequest
) {
    const userResponse = await api.post(
        "/users/",
        {
            email: data.email,
            password: data.password,
            role: data.role,
        }
    );

    if (data.role === "doctor") {
        await api.post(
            "/doctors/",
            {
                full_name: data.full_name.trim(),
                specialization: data.specialization?.trim(),
                cabinet: data.cabinet?.trim(),
                user_id: userResponse.data.id,
            }
        );
    } else {
        await api.post(
            "/patients/",
            {
                full_name: data.full_name.trim(),
                birth_date: data.birth_date,
                phone: data.phone?.trim(),
                user_id: userResponse.data.id,
            }
        );
    }

    return await login({
        email: data.email,
        password: data.password,
    });
}
