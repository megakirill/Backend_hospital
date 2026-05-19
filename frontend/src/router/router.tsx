import {
    createBrowserRouter,
} from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DoctorsPage from "../pages/DoctorsPage";
import DoctorDashboardPage from "../pages/DoctorDashboardPage";
import PatientAppointmentsPage from "../pages/PatientAppointmentsPage";
import ForbiddenPage from "../pages/ForbiddenPage";
import HomeRedirect from "../components/auth/HomeRedirect";
import ProtectedRoute from "../components/auth/ProtectedRoute";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <HomeRedirect />,
    },

    {
        path: "/login",
        element: <LoginPage />,
    },

    {
        path: "/register",
        element: <RegisterPage />,
    },

    {
        path: "/dashboard",
        element: <HomeRedirect />,
    },

    {
        path: "/doctors",
        element: (
            <ProtectedRoute allowedRole="patient">
                <DoctorsPage />
            </ProtectedRoute>
        ),
    },

    {
        path: "/my-appointments",
        element: (
            <ProtectedRoute allowedRole="patient">
                <PatientAppointmentsPage />
            </ProtectedRoute>
        ),
    },

    {
        path: "/doctor",
        element: (
            <ProtectedRoute allowedRole="doctor">
                <DoctorDashboardPage />
            </ProtectedRoute>
        ),
    },

    {
        path: "/forbidden",
        element: <ForbiddenPage />,
    },
]);
