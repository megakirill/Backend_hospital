import { ReactNode } from "react";

import { Navigate } from "react-router-dom";

import { UserRole } from "../../types/auth";
import {
    getAccessToken,
    getCurrentUserRole,
} from "../../utils/auth";

interface Props {
    allowedRole: UserRole;
    children: ReactNode;
}

export default function ProtectedRoute({
    allowedRole,
    children,
}: Props) {
    const token = getAccessToken();
    const role = getCurrentUserRole();

    if (!token || !role) {
        return <Navigate to="/login" replace />;
    }

    if (role !== allowedRole) {
        return <Navigate to="/forbidden" replace />;
    }

    return children;
}
