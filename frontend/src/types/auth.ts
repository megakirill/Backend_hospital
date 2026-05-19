export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    role: UserRole;
    full_name: string;
    birth_date?: string;
    phone?: string;
    specialization?: string;
    cabinet?: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export type UserRole =
    | "patient"
    | "doctor"
    | "admin";

export interface JwtPayload {
    sub: string;
    role: UserRole;
    type: "access" | "refresh";
    exp: number;
}
