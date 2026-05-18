export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    full_name: string;
    birth_date: string;
    phone: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}