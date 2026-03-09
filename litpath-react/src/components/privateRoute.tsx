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
                const res = await fetch("http://localhost:8080/auth/me", {
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