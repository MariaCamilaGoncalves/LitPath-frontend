import type { JSX } from "react";
import { Navigate } from "react-router-dom";


export default function PrivateRoute({ children }: { children: JSX.Element }) {
    const token = localStorage.getItem("token");


    if (!token) {
        return <Navigate to="/" replace />;
    }


    return children;
}
