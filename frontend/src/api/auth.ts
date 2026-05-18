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

    // CREATE USER
    const userResponse = await api.post(
        "/users/",
        {
            email: data.email,
            password: data.password,
            role: "patient",
        }
    );
    console.log("post до user", userResponse)
    // CREATE PATIENT
    await api.post(
        "/patients",
        {
            full_name: data.full_name,
            birth_date: data.birth_date,
            phone: data.phone,
            user_id: userResponse.data.id,
        }
    );
    console.log("пост к пациентам")
    // LOGIN
    return await login({
        email: data.email,
        password: data.password,
    });
}