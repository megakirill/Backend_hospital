import { Navigate } from "react-router-dom";

import {
    getCurrentUserRole,
    getHomePathByRole,
} from "../../utils/auth";

export default function HomeRedirect() {
    return (
        <Navigate
            to={getHomePathByRole(getCurrentUserRole())}
            replace
        />
    );
}
