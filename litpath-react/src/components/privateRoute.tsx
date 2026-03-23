import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import type { JSX } from "react";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
    const [isValid, setIsValid] = useState<boolean | null>(null);

    useEffect(() => {
        const validate = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setIsValid(false);
                return;
            }

            try {
                const API_URL = import.meta.env.VITE_API_URL;
                const res = await fetch(`${API_URL}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    setIsValid(true);
                } else {
                    localStorage.removeItem("token");
                    setIsValid(false);
                }
            } catch {
                localStorage.removeItem("token");
                setIsValid(false);
            }
        };

        validate();
    }, []);

    if (isValid === null) return null;
    if (!isValid) return <Navigate to="/" replace />;

    return children;
}