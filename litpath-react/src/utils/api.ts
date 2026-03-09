export const API_URL = "http://localhost:8080/users";

export interface User {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
}

export async function createUser(user: User) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            password: user.password,
            confirmPassword: user.confirmPassword
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Erro ao criar usuário");
    }

    return response.json();
}